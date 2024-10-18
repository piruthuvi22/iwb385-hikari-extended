import { withAuthenticationRequired } from "@auth0/auth0-react";

import { ComponentType } from "react";

interface ProtectedRouteProps {
  component: ComponentType;
  [key: string]: any;
}

const ProtectedRoute = ({ component, ...args }: ProtectedRouteProps) => {
    const Component = withAuthenticationRequired(component, args);
    return <Component />;
  };