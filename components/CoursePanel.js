import {
  Box,
  Button,
  Divider,
  VStack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import {useState} from "react";
import {motion} from "framer-motion";

function CoursePanel({renderCoursesList, renderSelectedCoursesList, addToSelectedCourses}) {
  const {getButtonProps, getDisclosureProps, isOpen} = useDisclosure({defaultIsOpen: true});
  const [hidden, setHidden] = useState(!isOpen);

  return (
    <>
    <div>
      <motion.div
        {...getDisclosureProps()}
        hidden={hidden}
        initial={false}
        onAnimationStart={() => setHidden(false)}
        onAnimationComplete={() => setHidden(!isOpen)}
        animate={{ width: isOpen ? 'fit-content' : 0 }}
        style={{
        whiteSpace: "nowrap",
        left: "0",
        height: "100vh",
        top: "0",
        overflowY: "scroll",
        className: 'coursePanel',
        }} 
      >
        <VStack className="coursesLayout">
        <Text className="text1">
            Asignaturas
        </Text>

        <Divider />

        {renderCoursesList()}

        <Divider />

        <Button width='100%' onClick={addToSelectedCourses} >
            Seleccionar curso
        </Button>

        <Divider />

        {renderSelectedCoursesList()}

        </VStack>
      </motion.div>
      </div>
      <Box height='100vh' width='fit-content' bg='#d1d1d15e' display='flex' flexDirection='column' justifyContent='center'>
      <Button className="hidePanelButton" {...getButtonProps()}>||</Button>
      </Box>
    </>
  );
}

export default CoursePanel;