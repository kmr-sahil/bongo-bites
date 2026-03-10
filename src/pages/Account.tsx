import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Account() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="section-container section-padding">
          <div className="max-w-md mx-auto text-center py-16">
            <User className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
            <h1 className="font-display text-2xl font-bold mb-3">
              Sign In Required
            </h1>
            <p className="text-muted-foreground mb-8">
              Please sign in to view your account details.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out");
    navigate("/");
  };

  const menuItems = [
    {
      icon: User,
      title: "Profile Information",
      description: "Update your name and email",
      href: "/account/profile",
    },
    {
      icon: Package,
      title: "Order History",
      description: "View your past orders",
      href: "/account/orders",
    },
    {
      icon: MapPin,
      title: "Addresses",
      description: "Manage your delivery addresses",
      href: "/account/addresses",
    },
    {
      icon: Heart,
      title: "Wishlist",
      description: "View your saved products",
      href: "/account/wishlist",
    },
  ];

  return (
    <Layout>
      <div className="bg-secondary/30 py-4">
        <div className="section-container">
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">My Account</span>
          </nav>
        </div>
      </div>

      <div className="section-container section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                My Account
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.name}!
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
