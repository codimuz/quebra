import React, { useState } from 'react';
import { FAB, Portal } from 'react-native-paper';

export interface FABAction {
  icon: string;
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

interface GlobalFABProps {
  actions: FABAction[];
  visible?: boolean;
}

const GlobalFAB: React.FC<GlobalFABProps> = ({ 
  actions = [], 
  visible = true 
}) => {
  const [open, setOpen] = useState(false);

  const onStateChange = ({ open }: { open: boolean }) => setOpen(open);

  if (!visible || actions.length === 0) {
    return null;
  }

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible={visible}
        icon={open ? 'close' : 'plus'}
        actions={actions.map(action => ({
          ...action,
          accessibilityLabel: action.accessibilityLabel || action.label,
        }))}
        onStateChange={onStateChange}
        onPress={() => {
          if (open) {
            // do something if the speed dial is open
          }
        }}
        accessibilityLabel="Menu de ações rápidas"
      />
    </Portal>
  );
};

export default GlobalFAB;
