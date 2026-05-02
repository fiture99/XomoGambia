import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useProviders } from "@/hooks/useProviders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, MapPin, Phone, Star, Briefcase, Calendar, Info, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function ProviderDetail() {
  const [, params] = useRoute("/providers/:id");
  const id = params?.id;
  const { getProvider, getCategory, approveProvider, rejectProvider, revokeProvider } = useProviders();
  const provider = id ? getProvider(id) : undefined;
  
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-bold">Provider Not Found</h2>
        <Button asChild variant="outline">
          <Link href="/providers">Back to Providers</Link>
        </Button>
      </div>
    );
  }

  const handleReject = () => {
    if (rejectReason.trim()) {
      rejectProvider(provider.id, rejectReason);
      setRejectDialogOpen(false);
      setRejectReason("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/providers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            {provider.name}
            {provider.approvalStatus === "approved" && <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Approved</Badge>}
            {provider.approvalStatus === "pending" && <Badge variant="outline" className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20">Pending Review</Badge>}
            {provider.approvalStatus === "rejected" && <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Rejected</Badge>}
          </h2>
          <p className="text-muted-foreground text-sm">
            Submitted {format(new Date(provider.submittedAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          {provider.approvalStatus === "pending" ? (
            <>
              <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Provider</DialogTitle>
                    <DialogDescription>
                      Provide a reason for rejecting {provider.name}. This will be saved for internal records.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">Rejection Reason</Label>
                      <Textarea 
                        id="reason" 
                        value={rejectReason} 
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Incomplete documentation, poor history..." 
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
                      Confirm Rejection
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button onClick={() => approveProvider(provider.id)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => revokeProvider(provider.id)}>
              Revoke to Pending
            </Button>
          )}
        </div>
      </div>

      {provider.approvalStatus === "rejected" && provider.rejectionReason && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md flex items-start gap-3 text-destructive">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Rejection Reason</h4>
            <p className="text-sm mt-1">{provider.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
              <p className="text-base">{provider.description}</p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {provider.categoryIds.map(id => {
                  const cat = getCategory(id);
                  return cat ? (
                    <Badge key={id} variant="outline" className="px-3 py-1 text-sm border-slate-300" style={{ borderLeftColor: cat.color, borderLeftWidth: '4px' }}>
                      {cat.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Services Offered</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {provider.services.map((service, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-sm">Location</p>
                  <p className="text-sm text-muted-foreground">{provider.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-sm">Phone Number</p>
                  <p className="text-sm text-muted-foreground">{provider.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Star className={`w-5 h-5 shrink-0 ${provider.rating > 0 ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium text-sm">Rating</p>
                  <p className="text-sm text-muted-foreground">
                    {provider.rating > 0 ? `${provider.rating} (${provider.reviewCount} reviews)` : 'No reviews yet'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-sm">Jobs Completed</p>
                  <p className="text-sm text-muted-foreground">{provider.completedJobs} via platform</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium text-sm">Experience</p>
                  <p className="text-sm text-muted-foreground">{provider.yearsActive} years active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}