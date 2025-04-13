import { Suspense, useEffect, useState } from "react";

import { Drawer } from "vaul";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { TModal } from "./lib/types";

type Props = {
  modal: TModal;
  handleClose: () => void;
  DialogComponent: React.FC<DialogPrimitive.DialogProps>;
  DrawerComponent?: typeof Drawer.Root;
};

function ModalComponent({
  modal,
  handleClose,
  DialogComponent,
  DrawerComponent,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if ("breakpoint" in modal) {
      function onChange(event: MediaQueryListEvent) {
        console.log("x");
        setIsMobile(event.matches);
      }

      const result = matchMedia(`(max-width: ${modal.breakpoint}px)`);
      result.addEventListener("change", onChange);
      setIsMobile(result.matches);

      return () => result.removeEventListener("change", onChange);
    }
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (modal.isOpen) {
      setIsMounted(true);
      setIsClosing(false);
    }
  }, [modal.isOpen]);

  // Handle external close
  useEffect(() => {
    if (!modal.isOpen && isMounted && !isClosing) {
      handleClose();
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, modal.exitAnimationDuration);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen]);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setIsClosing(true);
      handleClose();
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, modal.exitAnimationDuration);
      return () => clearTimeout(timer);
    }
  };

  if (!isMounted) return null;

  switch (modal.type) {
    case "base":
      return (
        <DialogComponent
          open={!isClosing && modal.isOpen}
          onOpenChange={onOpenChange}>
          <modal.component {...modal.props} />
        </DialogComponent>
      );
    case "mobile":
      if (!isMobile) {
        return (
          <DialogComponent
            open={!isClosing && modal.isOpen}
            onOpenChange={onOpenChange}>
            {<modal.component {...modal.props} />}
          </DialogComponent>
        );
      } else if (DrawerComponent) {
        return (
          <DrawerComponent
            open={!isClosing && modal.isOpen}
            onOpenChange={onOpenChange}>
            {modal.mobileComponent && (
              <modal.mobileComponent {...modal.props} />
            )}
          </DrawerComponent>
        );
      }
    case "mobile-only":
      if (isMobile && DrawerComponent) {
        return (
          <DrawerComponent
            data-slot="drawer"
            open={!isClosing && modal.isOpen}
            onOpenChange={onOpenChange}>
            {modal.component && <modal.component {...modal.props} />}
          </DrawerComponent>
        );
      }
      break;
  }
}

export default ModalComponent;
