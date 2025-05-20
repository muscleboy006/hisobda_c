import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const InstallPromptModal = ({ onInstall }) => {
  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md pointer-events-auto"
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle>Bosh ekranga qo‘shing</DialogTitle>
          <DialogDescription>
            Ilovani qurilmangizga o‘rnating — brauzer yopilganda ham u yo‘qolmaydi. Doimiy foydalanish uchun qulay bo‘ladi.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onInstall}>O‘rnatish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstallPromptModal;
