import React from 'react';

interface SystemHubProps {
  showTemporaryToast: (msg: string) => void;
  showTemporaryError: (msg: string) => void;
  onRefreshInteriors?: () => any;
  onRefreshMenu?: () => any;
  onRefreshDrafts?: () => any;
  activeAdminTab?: string;
}

export const AdminSystemHub: React.FC<SystemHubProps> = () => {
  return null;
};
