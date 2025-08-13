import { Link } from "react-router-dom";
import { 
  Facebook, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  Home
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Ward Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Digital Ward</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transforming municipal services through digital innovation. 
              Serving our community with efficiency and transparency.
            </p>
            <div className="flex space-x-3">
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/services" className="text-sm text-muted-foreground hover:text-primary">
                Services
              </Link>
              <Link to="/complaints" className="text-sm text-muted-foreground hover:text-primary">
                File Complaint
              </Link>
              <Link to="/events" className="text-sm text-muted-foreground hover:text-primary">
                Events
              </Link>
              <Link to="/queue" className="text-sm text-muted-foreground hover:text-primary">
                Book Appointment
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Popular Services</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/services/birth-certificate" className="text-sm text-muted-foreground hover:text-primary">
                Birth Certificate
              </Link>
              <Link to="/services/death-certificate" className="text-sm text-muted-foreground hover:text-primary">
                Death Certificate
              </Link>
              <Link to="/services/marriage-certificate" className="text-sm text-muted-foreground hover:text-primary">
                Marriage Certificate
              </Link>
              <Link to="/services/recommendation" className="text-sm text-muted-foreground hover:text-primary">
                Recommendation Letter
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Ward Office, Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+977-1-4444444</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>ward@example.gov.np</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Digital Ward System. All rights reserved.</p>
          <p className="mt-1">
            Powered by{" "}
            <span className="text-primary font-medium">
              Digital Nepal Initiative
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}