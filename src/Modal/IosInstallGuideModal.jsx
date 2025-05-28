// /Modal/IosInstallGuideModal.jsx
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

const IosInstallGuideModal = ({ onClose }) => {
  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md pointer-events-auto">
        <DialogHeader>
          <DialogTitle>Ilovani qo‘shish</DialogTitle>
          <DialogDescription>
            Safari’da pastdagi <strong>“Share”</strong> tugmasini bosing, so‘ng <strong>“Add to Home Screen”</strong> tanlang.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Yopish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IosInstallGuideModal;