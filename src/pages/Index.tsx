
import { Navigate } from 'react-router-dom';

const Index = () => {
  // This component will simply redirect to the Home page
  return <Navigate to="/" replace />;
};

export default Index;
