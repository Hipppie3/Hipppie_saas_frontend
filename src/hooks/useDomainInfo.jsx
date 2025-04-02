import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@api';

const useDomainInfo = () => {
 const [userForDomain, setUserForDomain] = useState(null);
 const [loadingDomain, setLoadingDomain] = useState(true);

 const location = useLocation();
 const hostname = window.location.hostname.replace(/^www\./, '');
 const domainFromHost = window.location.hostname;
 const slugFromPath = location.pathname.split('/')[1];

 const isLocalhost = domainFromHost === 'localhost';
 const isSaaSRootDomain = ['sportinghip.com', 'www.sportinghip.com'].includes(domainFromHost);
 const isCustomDomain = !isLocalhost && !isSaaSRootDomain;

 // 🔥 These should always be immediately available
 const domain = isCustomDomain ? hostname : null;
 const slug = !isCustomDomain ? slugFromPath : null;

 useEffect(() => {
  const fetchUser = async () => {
   try {
    if (isCustomDomain) {
     const res = await api.get(`/api/users/domain/${hostname}`);
     setUserForDomain(res.data.user);
    } else if (slugFromPath) {
     const res = await api.get(`/api/users/slug/${slugFromPath}`);
     setUserForDomain(res.data.user);
    } else {
     setUserForDomain(null);
    }
   } catch (err) {
    console.error("Error fetching domain/slug user:", err.response?.data || err.message);
    setUserForDomain(null);
   } finally {
    setLoadingDomain(false);
   }
  };

  fetchUser();
 }, [hostname, slugFromPath, isCustomDomain, location.pathname]);

 return {
  userForDomain,
  loadingDomain,
  domain,     // ✅ usable immediately
  slug,       // ✅ usable immediately
  hostname,
  domainFromHost,
  isLocalhost,
  isSaaSRootDomain,
  isCustomDomain,
  slugFromPath,
 };
};

export default useDomainInfo;
