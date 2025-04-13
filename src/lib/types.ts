interface IBaseModalFields {
  type: "base" | "mobile" | "mobile-only";
  component: React.FC<any>;
  isOpen: boolean;
  props: any;
  exitAnimationDuration: number;
}

interface IBaseModal extends IBaseModalFields {
  type: "base";
}

interface IMobileModal extends IBaseModalFields {
  type: "mobile";
  mobileComponent: React.FC<any>;
  breakpoint: number;
}

interface IMobileOnlyModal extends IBaseModalFields {
  type: "mobile-only";
  breakpoint: number;
  isMobileOnly: true;
}

export type TModal = IBaseModal | IMobileModal | IMobileOnlyModal;

export interface IBaseClientModal {
  component: React.FC<any>;
  exitAnimationDuration?: number;
}

export interface IMobileClientModal {
  component: React.FC<any>;
  mobileComponent: React.FC<any>;
  breakpoint?: number | string;
  exitAnimationDuration?: number;
}

export interface IMobileOnlyClientModal {
  component: React.FC<any>;
  breakpoint?: number | string;
  exitAnimationDuration?: number;
  isMobileOnly: true;
}

export type TClientModal =
  | IBaseClientModal
  | IMobileClientModal
  | IMobileOnlyClientModal;

export type TModalContext = {
  modals: TModal;
  open: (id: string) => void;
  close: (id: string) => void;
};
