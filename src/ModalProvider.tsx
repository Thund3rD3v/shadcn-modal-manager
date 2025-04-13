import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { TClientModal, TModal } from "./lib/types";
import ModalComponent from "./ModalComponent";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Drawer } from "vaul";

// --- Types ---
type ModalActions<K extends string, P> =
  | { type: "OPEN"; name: K; props?: Partial<P> }
  | { type: "CLOSE"; name: K };

type ProcessedModals<T extends Record<string, TClientModal>> = {
  [K in keyof T]: TModal & {
    props: T[K] extends { component: React.FC<infer P> } ? P : never;
  };
};

export function createModalProvider<T extends Record<string, TClientModal>>(
  clientModals: T,
  DialogComponent: React.FC<DialogPrimitive.DialogProps>,
  DrawerComponent?: typeof Drawer.Root
) {
  type ModalKeys = keyof T & string;
  type ModalMap = ProcessedModals<T>;

  const initialState = Object.entries(clientModals).reduce<ModalMap>(
    (acc, [key, modal]) => {
      const baseProps =
        ("component" in modal &&
          ({} as Parameters<typeof modal.component>[0])) ||
        {};
      const common = {
        isOpen: false,
        props: baseProps,
        exitAnimationDuration: modal.exitAnimationDuration || 200,
      };

      if ("component" in modal && "mobileComponent" in modal) {
        acc[key as ModalKeys] = {
          ...common,
          type: "mobile",
          component: modal.component,
          mobileComponent: modal.mobileComponent,
          breakpoint: modal.breakpoint || 480,
        } as any;
      } else if ("isMobileOnly" in modal) {
        acc[key as ModalKeys] = {
          ...common,
          type: "mobile-only",
          component: modal.component,
          breakpoint: modal.breakpoint || 480,
          isMobileOnly: true,
        } as any;
      } else {
        acc[key as ModalKeys] = {
          ...common,
          type: "base",
          component: modal.component,
        } as any;
      }

      return acc;
    },
    {} as ModalMap
  );

  // --- Reducer ---
  function reducer(
    state: ModalMap,
    action: ModalActions<ModalKeys, any>
  ): ModalMap {
    switch (action.type) {
      case "OPEN":
        return {
          ...state,
          [action.name]: {
            ...state[action.name],
            isOpen: true,
            props: {
              ...state[action.name].props,
              ...(action.props || {}),
            },
          },
        };
      case "CLOSE":
        return {
          ...state,
          [action.name]: {
            ...state[action.name],
            isOpen: false,
          },
        };
      default:
        return state;
    }
  }

  // --- Context ---
  const ModalContext = createContext<{
    state: ModalMap;
    dispatch: React.Dispatch<ModalActions<ModalKeys, any>>;
  } | null>(null);

  // --- Provider ---
  const ModalProvider = ({ children }: { children?: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
      <ModalContext.Provider value={{ state, dispatch }}>
        {Object.entries(state).map(([key, modal]) => (
          <ModalComponent
            key={key}
            modal={modal}
            handleClose={() => {
              dispatch({ type: "CLOSE", name: key });
            }}
            DialogComponent={DialogComponent}
            DrawerComponent={DrawerComponent}
          />
        ))}
        {children}
      </ModalContext.Provider>
    );
  };

  // --- Hooks ---
  const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
      throw new Error("useModal must be used within a ModalProvider");
    }

    const { dispatch } = context;

    const openModal = <K extends ModalKeys>(
      name: K,
      props?: Partial<ModalMap[K]["props"]>
    ) => {
      dispatch({ type: "OPEN", name, props });
    };

    const closeModal = <K extends ModalKeys>(name: K) => {
      dispatch({ type: "CLOSE", name });
    };

    return { openModal, closeModal };
  };

  return {
    ModalProvider,
    useModal,
  };
}
