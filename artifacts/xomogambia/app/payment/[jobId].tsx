import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type PayMethod = "wave" | "afrimoney" | "card" | "bank";

interface PaymentMethodDef {
  id: PayMethod;
  label: string;
  sub: string;
  icon: string;
  color: string;
  bg: string;
}

const METHODS: PaymentMethodDef[] = [
  { id: "wave", label: "Wave", sub: "Mobile money transfer", icon: "radio", color: "#1E3A5F", bg: "#EFF6FF" },
  { id: "afrimoney", label: "Afrimoney", sub: "Mobile money transfer", icon: "smartphone", color: "#E8A020", bg: "#FFFBEB" },
  { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard accepted", icon: "credit-card", color: "#1B6B3A", bg: "#F0FDF4" },
  { id: "bank", label: "Bank Transfer", sub: "Direct bank payment", icon: "home", color: "#6D28D9", bg: "#F5F3FF" },
];

function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}

export default function PaymentScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { jobs, markJobPaid } = useApp();

  const job = useMemo(() => jobs.find((j) => j.id === jobId), [jobs, jobId]);

  const [selectedMethod, setSelectedMethod] = useState<PayMethod>("wave");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [stage, setStage] = useState<"form" | "processing" | "success">("form");
  const [transactionRef, setTransactionRef] = useState("");

  const scaleAnim = useRef(new Animated.Value(0)).current;

  if (!job) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Job not found.</Text>
      </View>
    );
  }

  const method = METHODS.find((m) => m.id === selectedMethod)!;

  function validate() {
    if (selectedMethod === "wave" || selectedMethod === "afrimoney") {
      return phone.replace(/\D/g, "").length >= 7;
    }
    if (selectedMethod === "card") {
      return (
        cardNumber.replace(/\s/g, "").length === 16 &&
        expiry.length === 5 &&
        cvv.length >= 3 &&
        cardName.trim().length > 0
      );
    }
    return true;
  }

  function handlePay() {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const ref = "XG" + Date.now().toString(36).toUpperCase().slice(-8);
    setTransactionRef(ref);
    setStage("processing");

    setTimeout(() => {
      markJobPaid(job!.id, method.label, ref);
      setStage("success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }).start();
    }, 2200);
  }

  const amountFormatted = `D ${job.amount.toLocaleString()}`;

  if (stage === "processing") {
    return (
      <View style={[styles.root, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.processingTitle, { color: colors.foreground }]}>Processing Payment…</Text>
        <Text style={[styles.processingSubtitle, { color: colors.mutedForeground }]}>
          Please wait while we confirm your payment.
        </Text>
      </View>
    );
  }

  if (stage === "success") {
    const paidAt = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.successScroll,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
          ]}
        >
          <Animated.View style={[styles.successIcon, { backgroundColor: "#DCFCE7", transform: [{ scale: scaleAnim }] }]}>
            <Feather name="check" size={40} color="#15803D" />
          </Animated.View>

          <Text style={[styles.successTitle, { color: colors.foreground }]}>Payment Successful!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your payment has been received. The service provider has been notified.
          </Text>

          <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.receiptTitle, { color: colors.mutedForeground }]}>Receipt</Text>
            <ReceiptRow label="Company" value={job.companyName} colors={colors} />
            <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
            <ReceiptRow label="Service" value={job.categoryName} colors={colors} />
            <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
            <ReceiptRow label="Payment Method" value={method.label} colors={colors} />
            <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
            <ReceiptRow label="Date" value={paidAt} colors={colors} />
            <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
            <ReceiptRow label="Reference" value={transactionRef} colors={colors} mono />
            <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
            <View style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>Amount Paid</Text>
              <Text style={[styles.receiptAmountBig, { color: colors.primary }]}>{amountFormatted}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              router.replace(`/job/${job.id}`);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Back to Job</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 110,
          },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.foreground }]}>Pay for Job</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {job.companyName} · {job.categoryName}
        </Text>

        <View style={[styles.amountCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
          <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Amount Due</Text>
          <Text style={[styles.amountValue, { color: colors.primary }]}>{amountFormatted}</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Select Payment Method</Text>

        {METHODS.map((m) => {
          const active = selectedMethod === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.methodCard,
                {
                  backgroundColor: active ? m.bg : colors.card,
                  borderColor: active ? m.color : colors.border,
                  borderWidth: active ? 2 : 1,
                },
              ]}
              onPress={() => {
                setSelectedMethod(m.id);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.methodIconBox, { backgroundColor: m.bg }]}>
                <Feather name={m.icon as any} size={20} color={m.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodLabel, { color: colors.foreground }]}>{m.label}</Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>{m.sub}</Text>
              </View>
              {active && <Feather name="check-circle" size={20} color={m.color} />}
            </TouchableOpacity>
          );
        })}

        {(selectedMethod === "wave" || selectedMethod === "afrimoney") && (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formCardTitle, { color: colors.foreground }]}>
              {method.label} Phone Number
            </Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
              placeholder="+220 XXX XXXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Text style={[styles.inputHint, { color: colors.mutedForeground }]}>
              Enter the mobile number registered with {method.label}.
            </Text>
          </View>
        )}

        {selectedMethod === "card" && (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formCardTitle, { color: colors.foreground }]}>Card Details</Text>

            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Cardholder Name</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
              placeholder="Full name on card"
              placeholderTextColor={colors.mutedForeground}
              value={cardName}
              onChangeText={setCardName}
              autoCapitalize="words"
            />

            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Card Number</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={(v) => setCardNumber(formatCard(v))}
              maxLength={19}
            />

            <View style={styles.cardRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Expiry</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  value={expiry}
                  onChangeText={(v) => setExpiry(formatExpiry(v))}
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>CVV</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
                  placeholder="•••"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  secureTextEntry
                  value={cvv}
                  onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                />
              </View>
            </View>
          </View>
        )}

        {selectedMethod === "bank" && (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formCardTitle, { color: colors.foreground }]}>Bank Transfer Details</Text>
            <BankRow label="Bank Name" value="Trust Bank Gambia" colors={colors} />
            <BankRow label="Account Name" value="XomoGambia Ltd" colors={colors} />
            <BankRow label="Account Number" value="1234-5678-9012" colors={colors} mono />
            <BankRow label="Reference" value={`JOB-${job.id.slice(-6).toUpperCase()}`} colors={colors} mono />
            <View style={[styles.bankNote, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
              <Feather name="info" size={14} color="#92400E" />
              <Text style={[styles.bankNoteText, { color: "#92400E" }]}>
                Use the reference above when making your transfer so your payment is matched automatically.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.payBtn, { backgroundColor: validate() ? colors.primary : colors.border }]}
          onPress={handlePay}
          activeOpacity={0.85}
          disabled={!validate()}
        >
          <Feather name="lock" size={18} color="#fff" />
          <Text style={styles.payBtnText}>Pay {amountFormatted}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ReceiptRow({ label, value, colors, mono }: { label: string; value: string; colors: any; mono?: boolean }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.receiptValue, { color: colors.foreground, fontFamily: mono ? "Inter_400Regular" : "Inter_500Medium" }]}>
        {value}
      </Text>
    </View>
  );
}

function BankRow({ label, value, colors, mono }: { label: string; value: string; colors: any; mono?: boolean }) {
  return (
    <View style={styles.bankRow}>
      <Text style={[styles.bankLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.bankValue, { color: colors.foreground, fontFamily: mono ? "Inter_400Regular" : "Inter_500Medium" }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center", gap: 16 },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  amountCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  amountValue: { fontSize: 28, fontFamily: "Inter_700Bold" },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  methodIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  methodLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  methodSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  formCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 8, marginBottom: 4 },
  formCardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 14 },
  inputLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  inputHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardRow: { flexDirection: "row" },
  bankRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e5e7eb" },
  bankLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  bankValue: { fontSize: 13 },
  bankNote: { flexDirection: "row", gap: 8, alignItems: "flex-start", borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 12 },
  bankNoteText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  payBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  notFound: { textAlign: "center", marginTop: 40, fontSize: 15 },
  processingTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 8 },
  processingSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
  successScroll: { alignItems: "center", paddingHorizontal: 24 },
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 8, textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 28 },
  receiptCard: { width: "100%", borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24 },
  receiptTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  receiptLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  receiptValue: { fontSize: 13 },
  receiptAmountBig: { fontSize: 20, fontFamily: "Inter_700Bold" },
  receiptDivider: { height: StyleSheet.hairlineWidth },
  doneBtn: { width: "100%", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  doneBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
