
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <Coffee className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Welcome to MealVerse</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your complete meal management system for corporate cafeterias
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-primary text-primary hover:bg-primary/10"
            onClick={() => navigate("/employees")}
          >
            Manage Employees
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
