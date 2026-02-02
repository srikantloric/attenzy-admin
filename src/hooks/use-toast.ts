import * as React from "react";

const ToastContext = React.createContext({
  toast: () => {}
});

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider(props) {
  const [toasts, setToasts] = React.useState([]);

  const toast = ({ title, description, variant }) => {
    const id = crypto.randomUUID();

    setToasts((prev) => [
      ...prev,
      { id, title, description, variant }
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((t) => t.id !== id)
      );
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {props.children}

      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-md border px-4 py-3 shadow-md ${
              t.variant === "destructive"
                ? "bg-destructive text-destructive-foreground"
                : "bg-background"
            }`}
          >
            {t.title && (
              <div className="font-medium">
                {t.title}
              </div>
            )}
            {t.description && (
              <div className="text-sm text-muted-foreground">
                {t.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
