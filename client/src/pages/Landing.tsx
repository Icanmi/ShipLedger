import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Shield, Clock, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                <Ship className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">ShipLedger</h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Blockchain-Powered Shipping & Trade Finance Platform
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bringing unprecedented transparency, collaboration, and efficiency to the global logistics and trade ecosystem.
            </p>
          </div>

          {/* CTA */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-demo"
            >
              View Demo
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Blockchain Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Every transaction recorded on BlockDAG testnet for complete transparency
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Real-Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track 120+ events from origin to delivery with live updates
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Global Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect shippers, carriers, customs, and ports seamlessly
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Ship className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Smart Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Digital Bills of Lading with instant sharing and verification
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Value Prop */}
          <div className="mt-16 p-8 bg-card rounded-lg border border-border">
            <h2 className="text-2xl font-semibold mb-4">
              Transparent Trade. Trusted Shipping.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ShipLedger eliminates paper-based documentation, reduces delays, and prevents fraud in maritime trade. 
              According to the African Development Bank, logistics inefficiencies add up to 40% to the cost of goods. 
              We're changing that with blockchain technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
