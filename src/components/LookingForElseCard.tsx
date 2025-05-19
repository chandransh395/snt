
import { Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Link } from 'react-router-dom';

interface LookingForElseCardProps {
  className?: string;
  darkTheme?: boolean;
}

const LookingForElseCard = ({ className, darkTheme = false }: LookingForElseCardProps) => {
  return (
    <Card 
      className={`overflow-hidden ${darkTheme ? 'bg-gray-900 text-white border-gray-800' : 'bg-white'} ${className}`}
    >
      <CardHeader className={`pb-3 ${darkTheme ? 'border-b border-gray-800' : 'border-b'}`}>
        <CardTitle className="text-xl font-semibold">
          Looking for Something Else?
        </CardTitle>
        <CardDescription className={darkTheme ? 'text-gray-400' : 'text-gray-500'}>
          Can't find what you're looking for? Contact us for a custom travel experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <p className={`mb-4 ${darkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
          Our travel experts can help you plan a personalized journey to your dream destination. 
          Whether it's a private tour, honeymoon package, or group adventure, we've got you covered.
        </p>
        <div className={`p-3 rounded-lg mb-3 ${darkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h4 className="font-medium mb-1">Why contact us:</h4>
          <ul className={`list-disc list-inside space-y-1 text-sm ${darkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>Personalized itineraries</li>
            <li>Expert local guides</li>
            <li>Special group rates</li>
            <li>24/7 support during your travels</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Link to="/contact" className="w-full">
          <Button 
            className={`w-full ${darkTheme ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-travel-gold hover:bg-amber-600 text-black'}`}
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Us Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default LookingForElseCard;
