import React from "react";
import {
  Box,
  Button,
  IconButton,
  Divider,
  VStack,
  Text,
  useDisclosure,
  HStack,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerFooter,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberIncrementStepper,
  Select
} from "@chakra-ui/react";
import {AddIcon, DownloadIcon} from "@chakra-ui/icons";
import {useState} from "react";
import {motion} from "framer-motion";

function get(object, key, default_value) {
  var result = object[key];
  return (typeof result !== "undefined") ? result : default_value;
}

const DrawerNewActivity = ({onClickSave, inputs, misc, configs}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()
  
  const flushInputs = () => {
    inputs.newCode = '';
    inputs.newName = '';
    inputs.newRoom = '';
    misc.invalidNewName = false;
    misc.invalidNewSch = false;
  }

  const additionProcedure = () => {
    onClickSave(); 
    if(misc.invalidNewName || misc.invalidNewSch);
    else{
      onClose(); 
      flushInputs();
    }
  }

  const saveInputValue = (event, id) => {
    inputs[id] = event.target.value;
  }

  const saveNumberInputValue = (event, id) => {
    inputs[id] = get(event, 1, false)? event[0] + event[1] : event[0];
  }

  const saveSelectValue = (value, id) =>{
    inputs.newDay = document.getElementById('selected_day').value;
  }

  return (
    <>
      <IconButton width='15%' ref={btnRef} bg="#C2F8C3D0" onClick={onOpen} icon={<AddIcon/>}/>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
        closeOnOverlayClick={false}
        lockFocusAcrossFrames={true}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Nueva Actividad</DrawerHeader>

          <DrawerBody>
            <VStack spacing='10px'>
            <Input placeholder='Código (opcional)' defaultValue={inputs.newCode} onChange={(e)=>saveInputValue(e, 'newCode')}/>
            <Divider orientation=""/>
            <Input placeholder='Nombre' defaultValue={inputs.newName} onChange={(e)=>saveInputValue(e, 'newName')} isInvalid={misc.invalidNewName}/>
            <Divider />
            <Input placeholder='Lugar (opcional)' defaultValue={inputs.newRoom} onChange={(e)=>saveInputValue(e, 'newRoom')}/>
            <Divider />
            <Text> Día </Text>
            <Select id="selected_day" onChange={saveSelectValue}>
              <option value='lun'>Lunes</option>
              <option value='mar'>Martes</option>
              <option value='mie'>Miercoles</option>
              <option value='jue'>Jueves</option>
              <option value='vie'>Viernes</option>
            </Select>
            <Divider />
            <Text> Hora de inicio </Text>
            <HStack>
              <NumberInput size='md' 
                           maxW={24} 
                           defaultValue={inputs.newHHi} 
                           min={configs.hori[0]} 
                           max={configs.horf[0]-1} 
                           onChange={(e)=>saveNumberInputValue(e, 'newHHi')}
                           isInvalid={misc.invalidNewSch}
                           >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <NumberInput size='md' 
                          maxW={24} 
                          defaultValue={inputs.newMMi} 
                          min={0} 
                          max={59} 
                          onChange={(e)=>saveNumberInputValue(e, 'newMMi')}
                          isInvalid={misc.invalidNewSch}
                          >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>
            <Text> Hora de término </Text>
            <HStack>
              <NumberInput size='md' 
                          maxW={24} 
                          defaultValue={inputs.newHHf} 
                          min={configs.hori[0]} 
                          max={configs.horf[0]-1} 
                          onChange={(e)=>saveNumberInputValue(e, 'newHHf')}
                          isInvalid={misc.invalidNewSch}
                          >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <NumberInput size='md' 
                           maxW={24} 
                           defaultValue={inputs.newMMf} 
                           min={0} 
                           max={59} 
                           onChange={(e)=>saveNumberInputValue(e, 'newMMf')}
                           isInvalid={misc.invalidNewSch}
                           >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>
          </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={e=>{onClose(); flushInputs()}}>Cancelar</Button>
            <Button colorScheme='blue' onClick={additionProcedure}>Guardar</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

function CoursePanel({renderCoursesList, renderSelectedCoursesList, addToSelectedCourses, addUserDefined, downloader, inputs, misc, configs}) {
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

        <HStack width='100%' spacing={2}>
          <Button width='100%' onClick={addToSelectedCourses} >
              Seleccionar curso
          </Button>
          <DrawerNewActivity onClickSave={addUserDefined} inputs={inputs} misc={misc} configs={configs}/>
          <IconButton width='15%' bg="#C2C3F8D0" onClick={downloader} icon={<DownloadIcon/>} />
        </HStack>

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