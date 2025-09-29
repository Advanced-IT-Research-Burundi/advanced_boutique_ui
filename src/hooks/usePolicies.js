import { useAuth } from "../contexts/AuthContext";


const usePolicies = () => {
    const { user } = useAuth();

    const isAdmin = () => user?.role === 'admin';
    const isEditor = () => user?.role === 'editor';
    const isViewer = () => user?.role === 'viewer';
    const isSalesPerson = () => user?.role === 'salesperson';

    const isAllowed = (policy) => {
        if (!policy) return true;
        return policy.includes(user?.role);
    }

    const isAllowedListRole = (roles) => {
        if (!roles) return true;
        for (let role of roles) {
            if (role === user?.role) return true;
        }
        return false;
    }

    const isAllowedRoute = (route) => {
        if (!route.policy) return true;
        return isAllowedListRole(route.policy);
    }

    return {
        isAdmin,
        isEditor,
        isViewer,
        isSalesPerson,
        isAllowed,
        isAllowedRoute,
        isAllowedListRole
    }

    
}

export default usePolicies;
