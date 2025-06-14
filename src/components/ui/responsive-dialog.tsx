import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveDialogProps extends React.ComponentProps<typeof Dialog> {
  children: React.ReactNode;
}

export function ResponsiveDialog({
  children,
  ...props
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <Drawer {...props}>{children}</Drawer>;
  }

  return <Dialog {...props}>{children}</Dialog>;
}

interface ResponsiveDialogContentProps
  extends React.ComponentProps<typeof DialogContent> {
  children: React.ReactNode;
}

export function ResponsiveDialogContent({
  children,
  ...props
}: ResponsiveDialogContentProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerContent {...props}>
        <div className="px-4 pb-2">{children}</div>
      </DrawerContent>
    );
  }

  return <DialogContent {...props}>{children}</DialogContent>;
}

interface ResponsiveDialogHeaderProps
  extends React.ComponentProps<typeof DialogHeader> {
  children: React.ReactNode;
}

export function ResponsiveDialogHeader({
  children,
  ...props
}: ResponsiveDialogHeaderProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerHeader {...props}>{children}</DrawerHeader>;
  }

  return <DialogHeader {...props}>{children}</DialogHeader>;
}

interface ResponsiveDialogFooterProps
  extends React.ComponentProps<typeof DialogFooter> {
  children: React.ReactNode;
}

export function ResponsiveDialogFooter({
  children,
  ...props
}: ResponsiveDialogFooterProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div {...props} className="flex justify-center gap-2 px-4 pb-2">
        {children}
      </div>
    );
  }

  return <DialogFooter {...props}>{children}</DialogFooter>;
}

interface ResponsiveDialogTitleProps
  extends React.ComponentProps<typeof DialogTitle> {
  children: React.ReactNode;
}

export function ResponsiveDialogTitle({
  children,
  ...props
}: ResponsiveDialogTitleProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTitle {...props}>{children}</DrawerTitle>;
  }

  return <DialogTitle {...props}>{children}</DialogTitle>;
}

interface ResponsiveDialogDescriptionProps
  extends React.ComponentProps<typeof DialogDescription> {
  children: React.ReactNode;
}

export function ResponsiveDialogDescription({
  children,
  ...props
}: ResponsiveDialogDescriptionProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerDescription {...props}>{children}</DrawerDescription>;
  }

  return <DialogDescription {...props}>{children}</DialogDescription>;
}
