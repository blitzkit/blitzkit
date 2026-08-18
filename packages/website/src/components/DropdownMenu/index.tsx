import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarLabel,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  type MenubarCheckboxItemProps,
  type MenubarContentProps,
  type MenubarLabelProps,
  type MenubarProps,
  type MenubarRadioGroupProps,
  type MenubarRadioItemProps,
  type MenubarSubContentProps,
  type MenubarSubProps,
  type MenubarSubTriggerProps,
  type MenubarTriggerProps,
} from "radix-ui/menubar";

function Root(props: MenubarProps) {
  return <Menubar {...props} />;
}

function Trigger(props: MenubarTriggerProps) {
  return <MenubarTrigger {...props} />;
}

function Content(props: MenubarContentProps) {
  return <MenubarContent {...props} />;
}

function Sub(props: MenubarSubProps) {
  return <MenubarSub {...props} />;
}

function SubTrigger(props: MenubarSubTriggerProps) {
  return <MenubarSubTrigger {...props} />;
}

function SubContent(props: MenubarSubContentProps) {
  return <MenubarSubContent {...props} />;
}

function Label(props: MenubarLabelProps) {
  return <MenubarLabel {...props} />;
}

function CheckboxItem(props: MenubarCheckboxItemProps) {
  return <MenubarCheckboxItem {...props} />;
}

function RadioGroup(props: MenubarRadioGroupProps) {
  return <MenubarRadioGroup {...props} />;
}

function RadioItem(props: MenubarRadioItemProps) {
  return <MenubarRadioItem {...props} />;
}

export const DropdownMenu = {
  Root,
  Trigger,
  Content,
  Sub,
  SubTrigger,
  SubContent,
  Label,
  CheckboxItem,
  RadioGroup,
  RadioItem,
};
