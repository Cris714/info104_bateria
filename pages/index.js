import { Button, useDisclosure } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function App() {
  const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure();
  const [hidden, setHidden] = useState(!isOpen);

  return (
    <div>
      <Button {...getButtonProps()}>Toggle</Button>
      <motion.div
        {...getDisclosureProps()}
        hidden={hidden}
        initial={false}
        onAnimationStart={() => setHidden(false)}
        onAnimationComplete={() => setHidden(!isOpen)}
        animate={{ width: isOpen ? 500 : 0 }}
        style={{
          background: "red",
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "absolute",
          right: "0",
          height: "100vh",
          top: "0"
        }}
      >
        welcome home
      </motion.div>
    </div>
  );
}