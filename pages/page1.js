import Head from "next/head";
import React, {useState, useRef, useEffect} from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  IconButton,
  Divider,
  HStack,
  VStack,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverHeader,
  SimpleGrid,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
} from "@chakra-ui/react";

import {AddIcon, CloseIcon, DownloadIcon, InfoOutlineIcon} from "@chakra-ui/icons"
import {useDisclosure} from "@chakra-ui/react";
import {saveAs} from 'file-saver'

import * as htmlToImage from 'html-to-image';

import data from "/public/data/asignaturas_v2.json"



var block2HHMM = {
  1: [[8,10], [9,40]],
  2: [[9,50], [11,20]],
  3: [[11,30], [13,0]],
  4: [[14,10], [15,40]],
  5: [[15,50], [17,20]],
  6: [[17,30], [19,0]]
}

var dayName = {
  'lun': 'Lunes',
  'mar': 'Martes',
  'mie': 'Miércoles',
  'jue': 'Jueves',
  'vie': 'Viernes',
  'sab': 'Sábado',
  'dom': 'Domingo'
}

var colorPool = ['#d98880', 
                 '#aab7b8',
                 '#ff8dfa', 
                 '#bb8fce', 
                 '#FF5733', 
                 '#FFC300', 
                 '#DAF7A6', 
                 '#85c1e9', 
                 '#a3e4d7',
                 ]

var colors = {} // {KEY: courseCode, VALUE: color}

var configs = {
  'hmax': '65vh', 
  'wmax': '10.5vw', 
  'hori': [7, 0], // [HH, MM]
  'horf': [19, 0], // [HH, MM]
  'rangeStep': 30, // MM
  'includeSab': false,
  'includeDom': false,
  'lastDay': new Date('2022-07-15T23:59:59-04:00'),
}

var inputValues = { 
  newHHi: 8,
  newMMi: 0,
  newHHf: 9,
  newMMf: 0,
  newDay: 'lun',
} 
var miscellaneous = {
  invalidNewName: false,
  invalidNewSch: false,
}


function get(object, key, default_value) {
  var result = object[key];
  return (typeof result !== "undefined") ? result : default_value;
}

function splitSize(value){
  let num, unit;
  unit = value.replace((num = parseFloat(value)).toString(), '');
  return [num, unit];
}

function saveInputValue(event, id){
  inputValues[id] = event.target.value;
}

function saveNumberInputValue(event, id){
  inputValues[id] = get(event, 1, false)? event[0] + event[1] : event[0];
}

function saveSelectValue(value, id){
  inputValues[id] = value;
}

function downloadImage(src){
  saveAs(src, 'image.jpg')
}



const DrawerNewActivity = ({onClickSave}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()

  const flushInputs = () => {
    inputValues.newCode = '';
    inputValues.newName = '';
    inputValues.newRoom = '';
    miscellaneous.invalidNewName = false;
    miscellaneous.invalidNewSch = false;
  }

  const additionProcedure = () => {
    onClickSave(); 
    if(miscellaneous.invalidNewName || miscellaneous.invalidNewSch);
    else{
      onClose(); 
      flushInputs();
    }
  }

  return (
    <>
      <IconButton className='button1' ref={btnRef} colorScheme='teal' onClick={onOpen} icon={<AddIcon/>}/>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Nueva Actividad</DrawerHeader>

          <DrawerBody>
            <VStack spacing='10px'>
            <Input placeholder='Código (opcional)' defaultValue={inputValues.newCode} onChange={(e)=>saveInputValue(e, 'newCode')}/>
            <Divider orientation=""/>
            <Input placeholder='Nombre' defaultValue={inputValues.newName} onChange={(e)=>saveInputValue(e, 'newName')} isInvalid={miscellaneous.invalidNewName}/>
            <Divider />
            <Input placeholder='Lugar (opcional)' defaultValue={inputValues.newRoom} onChange={(e)=>saveInputValue(e, 'newRoom')}/>
            <Divider />
            <Text> Día </Text>
            <Select >
              <option onClick={(e)=>saveSelectValue('lun', 'newDay')}>Lunes</option>
              <option onClick={(e)=>saveSelectValue('mar', 'newDay')}>Martes</option>
              <option onClick={(e)=>saveSelectValue('mie', 'newDay')}>Miercoles</option>
              <option onClick={(e)=>saveSelectValue('jue', 'newDay')}>Jueves</option>
              <option onClick={(e)=>saveSelectValue('vie', 'newDay')}>Viernes</option>
              {configs.includeSab? <option onClick={(e)=>saveSelectValue('sab', 'newDay')}>Sabado</option> : <></>}
              {configs.includeDom? <option onClick={(e)=>saveSelectValue('dom', 'newDay')}>Domingo</option> : <></>}
            </Select>
            <Divider />
            <Text> Hora de inicio </Text>
            <HStack>
              <NumberInput size='md' 
                           maxW={24} 
                           defaultValue={inputValues.newHHi} 
                           min={configs.hori[0]} 
                           max={configs.horf[0]-1} 
                           onChange={(e)=>saveNumberInputValue(e, 'newHHi')}
                           isInvalid={miscellaneous.invalidNewSch}
                           >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <NumberInput size='md' 
                          maxW={24} 
                          defaultValue={inputValues.newMMi} 
                          min={0} 
                          max={59} 
                          onChange={(e)=>saveNumberInputValue(e, 'newMMi')}
                          isInvalid={miscellaneous.invalidNewSch}
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
                          defaultValue={inputValues.newHHf} 
                          min={configs.hori[0]} 
                          max={configs.horf[0]-1} 
                          onChange={(e)=>saveNumberInputValue(e, 'newHHf')}
                          isInvalid={miscellaneous.invalidNewSch}
                          >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <NumberInput size='md' 
                           maxW={24} 
                           defaultValue={inputValues.newMMf} 
                           min={0} 
                           max={59} 
                           onChange={(e)=>saveNumberInputValue(e, 'newMMf')}
                           isInvalid={miscellaneous.invalidNewSch}
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

const DrawerDaysLeft = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()
  
  const Ref = useRef(null);
  const [timer, setTimer] = useState('0 días 0 horas 0 minutos 0 segundos');
  
  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    const days = Math.floor((total / 1000 / 60 / 60 / 24));
    return {
        total, days, hours, minutes, seconds
    };
  }
  
  const updateTimer = (e) => {
    let { total, days, hours, minutes, seconds } = getTimeRemaining(e);
      if (total >= 0) {
        setTimer(
          days + ' días ' + hours + ' horas ' + minutes + ' minutos ' + seconds + ' segundos'
        )
    }
  }
  
  const startTimer = (e) => {
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      updateTimer(e);
    }, 1000)
    Ref.current = id;
  }
  

  useEffect(() => {
    startTimer(configs.lastDay);
  }, []);
 
  return (
    <>
      <IconButton className='button1' ref={btnRef} onClick={onOpen} icon={<InfoOutlineIcon/>}/>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
        size='xl'
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Días de sufrimiento restantes</DrawerHeader>

          <DrawerBody>
            <VStack>
              <SimpleGrid columns={8}>

              </SimpleGrid>
              <Text>Fin del semestre</Text>
              <Text fontSize='3xl'>{timer}</Text>
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>Salir</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

const Card = ({line1, line2, line3, bg, x, y, h, w}) =>{
  return(
  <VStack bg={bg}
          position='absolute' 
          left={x} 
          top={y} 
          width={w} 
          height={h} 
          borderRadius='15'
          overflow='hidden'
          justifyContent='center'
          boxShadow='lg'
          spacing='0' 
          fontSize='1.5vh'
          className='text3'
          >
    {line1 != ''? <Text> {line1} </Text> : <></>}
    {line2 != ''? <Text> {line2} </Text> : <></>}
    {line3 != ''? <Text> {line3} </Text> : <></>}
  </VStack> 
  )
}

const SchRange = ({wmax, hmax, hori, horf}) => {
  const asNum = (HHMM) => (60*(HHMM[0]-hori[0])+HHMM[1]-hori[1]);
  const asHHMM = (n) => ([Math.floor(n/60)+hori[0], n%60+hori[1]]);
  const asfmt = (HHMM) => (HHMM[1] < 10? HHMM[0].toString()+':0'+HHMM[1].toString() : HHMM[0].toString()+':'+HHMM[1].toString());

  let hUnit, wUnit;
  [hmax, hUnit] = splitSize(hmax);
  [wmax, wUnit] = splitSize(wmax);
  
  let step = configs.rangeStep;
  let num = Math.round(asNum(horf) / step) + 1
  let ystep = hmax / (num-1);
  let range = [];
  
  for(let i = 0; i < num; i++){
    range.push([asfmt(asHHMM(Math.round(i*step))), i*ystep-1]);
  }
  
  return(
    <VStack>
      <Box align='center' width='1vw' height='4vh' fontSize='3vh' />
      <Box position='relative' width={wmax.toString()+wUnit} height={hmax.toString()+hUnit}>
        {range.map(([str, y]) => (
          <Text className='text2' position='absolute' right='0vw' top={y.toString()+hUnit}> {str} </Text>
        ))}
      </Box>
    </VStack>
  )
}



class Main extends React.Component{
  constructor(){
    super()
    this._idGenerator = 0;
    this.courses = data;
    this.colors = [...colorPool];
    this.selectedCourses = {};
    this.userDefinedCourses = {};

    // Almacena un grafo para cada dia: {KEY: courseCode, VALUE: {info: [x, y, h, w], links: [...aristas...], group: int}}
    this.schedule = {'lun':{}, 'mar':{}, 'mie':{}, 'jue':{}, 'vie':{}}; 
    if(configs.includeSab) this.schedule = {...this.schedule, 'sab': {}};
    if(configs.includeDom) this.schedule = {...this.schedule, 'dom': {}};

    this.state = {
      selection: {code: '', num: ''},
    };

    // Ajustes iniciales
    Object.keys(this.courses).map((course) => (this.courses[course]["isVisible"] = true));

    // Binding
    this.addToSelectedCourses = this.addToSelectedCourses.bind(this);
    this.addUserDefined = this.addUserDefined.bind(this);
    this.downloadSchedule = this.downloadSchedule.bind(this);

    if(false){
      configs.hmax = '500px';
      configs.wmax = '150px';
    }
  }

  adjustSchedule(code, day){
    let [wmax, wUnit] = splitSize(configs.wmax);

    let dayGraph = this.schedule[day];
    let graph = {}; // subgrafo conexo afectado
    // consigue el subgrafo conexo afectado completo
    const getGraph = (cid) => {
      graph[cid] = true;
      for(let i = 0; i < dayGraph[cid].links.length; i++){
        if(!get(graph, dayGraph[cid].links[i], false)){
          getGraph(dayGraph[cid].links[i]);
        }
      }
    }
    getGraph(code);

    let cols = {}; // nueva disposicion de columnas, necesario para obtener nCh y k
    let k = 0;

    // armado de columnas: nodos que no estan relacionados van en columnas iguales
    Object.keys(graph).map((cid) => {
      while(k < 10){
        // crea nueva columna si no existe
        if(!get(cols, k, false)){
          cols[k] = [cid];
          k = 0;
          break;
        }
        // columna no existe
        else{
          let i = 0;
          // verifica que no haya nodos relacionados a cid
          for(; i < cols[k].length; i++){
            if(dayGraph[cid].links.includes(cols[k][i])){
              break;
            }
          }
          // no hay nodos relacionados con cid, se añade a la columna
          if(i == cols[k].length){
            cols[k].push(cid);
            k = 0;
            break;
          }
          // hay un nodo relacionado: cid debe estar en otra columna
          else{
            k++;
          }
        }
      }
    })
    
    let nCh = Object.keys(cols).length;
    // nuevas variables conseguidas, se actualizan todos los x y w del subgrafo afectado 
    Object.entries(cols).map(([k, col]) => {
      col.map((cid) => {
        this.schedule[day][cid].info[0] = (k * (wmax/nCh)).toString()+wUnit;
        this.schedule[day][cid].info[3] = (wmax/nCh).toString()+wUnit;
      })
    })
  }

  addToSchedule(code, group, day, HHMMi, HHMMf, userDefined){
    code = code + '_' + HHMMi[0].toString() + HHMMi[1].toString();

    let [hmax, hUnit] = splitSize(configs.hmax);

    let hori = configs.hori;
    let horf = configs.horf;
    const asNum = (HHMM) => (60*(HHMM[0]-hori[0])+HHMM[1]-hori[1]); // conversor: hora -> numerico
    
    let range = asNum(horf)
    // obtencion de variables de posicionamiento
    let y = hmax / range * asNum(HHMMi);
    let h = hmax / range * (asNum(HHMMf)-asNum(HHMMi));
    
    let collision = []; // aristas del nuevo nodo incluido
    let dayGraph = this.schedule[day]; // grafo completo del dia

    // obtencion de aristas (colisiones)
    Object.entries(dayGraph).map(([cid, node]) => {
      let [ny, ] = splitSize(node.info[1]);
      let [nh, ] = splitSize(node.info[2]);
      if((y <= ny+nh && y >= ny) || (y+h >= ny && y+h <= ny+nh) || (y <= ny && y+h >= ny+nh) || (y >= ny && y+h <= ny+nh)){
        collision.push(cid);
        this.schedule[day][cid].links.push(code); 
      }
    })

    // definicion incompleta del nuevo nodo
    this.schedule[day][code] = {
      info: [-1, y.toString()+hUnit, h.toString()+hUnit, -1], 
      links: collision, 
      group: group, 
      userDefined: 
      userDefined
    }; 

    // Reajusta el nuevo grafo formado
    this.adjustSchedule(code, day);
  }

  removeFromSchedule(code, day, HHMMi){
    code = code + '_' + HHMMi[0].toString() + HHMMi[1].toString();
    let node = this.schedule[day][code];
    node.links.map((cid) => {
      let index = this.schedule[day][cid].links.indexOf(code);
      this.schedule[day][cid].links.splice(index, 1);
    })

    node.links.map((cid) => {
      this.adjustSchedule(cid, day);
    })

    delete this.schedule[day][code];
  }

  handleSelection(code, groupNum){
    if(this.state.selection.code+this.state.selection.num != code+groupNum){
      if(this.state.selection.code != ''){
        let cid = this.state.selection.code;
        let cgnum = this.state.selection.num;
        this.courses[cid].groups[cgnum].sch.map(([day, block]) => {
          let [HHMMi, _] = block2HHMM[block];
          this.removeFromSchedule(cid, day, HHMMi);
        })
        this.colors.push(colors[cid]);
        delete colors[cid];
      }
      this.courses[code].groups[groupNum].sch.map(([day, block]) => {
        let [HHMMi, HHMMf] = block2HHMM[block];
        this.addToSchedule(code, groupNum, day, HHMMi, HHMMf, false);
      })
      this.setState({selection: {code: code, num: groupNum}});
      colors[code] = this.colors.pop();
    }
    else{
      this.setState({selection: {code: '', num: ''}});
      this.courses[code].groups[groupNum].sch.map(([day, block]) => {
        let [HHMMi, _] = block2HHMM[block];
        this.removeFromSchedule(code, day, HHMMi);
      })
      this.colors.push(colors[code]);
      delete colors[code];
    }
  }

  addToSelectedCourses(){
    if(this.state.selection.code != ''){
      let code = this.state.selection.code;
      let group = this.state.selection.num;

      this.selectedCourses[code] = group;
      this.courses[code].isVisible = false;

      this.setState({selection: {code: '', num: ''}});
    }
  }

  addUserDefined(){
    let title = get(inputValues, 'newName', '');

    // comprueba titulo no vacio
    if(title == ''){
      miscellaneous.invalidNewName = true;
      this.setState({});
      return;
    }
    miscellaneous.invalidNewName = false;

    let HHMMi = [parseInt(inputValues.newHHi), parseInt(inputValues.newMMi)];
    let HHMMf = [parseInt(inputValues.newHHf), parseInt(inputValues.newMMf)];
    
    // comprobacion de horario
    if(60*HHMMf[0]+HHMMf[1] < 60*HHMMi[0]+HHMMi[1]+20){
      miscellaneous.invalidNewSch = true;
      this.setState({});
      return;
    }
    miscellaneous.invalidNewSch = false;

    let cid = this._idGenerator++;
    let code = get(inputValues, 'newCode', '') ;
    let room = get(inputValues, 'newRoom', '');
    let day = inputValues.newDay;

    this.userDefinedCourses[cid] = {code: code, title: title, room: room, HHMMi: HHMMi, day: day};
    
    colors[cid] = this.colors.pop();
    this.addToSchedule(code+'_'+cid.toString(), -1, day, HHMMi, HHMMf, true);
    this.setState({})
  }

  removeCourse(code, groupNum){
    this.courses[code].isVisible = true;
    this.colors.push(colors[code]);
    delete this.selectedCourses[code];
    delete colors[code];
    this.courses[code].groups[groupNum].sch.map(([day, block]) => {
      let [HHMMi, _] = block2HHMM[block];
      this.removeFromSchedule(code, day, HHMMi);
    })
    this.setState({selection: {code: '', num: ''}});
  }

  removeUserDefined(cid){
    this.removeFromSchedule(this.userDefinedCourses[cid].code+'_'+cid, this.userDefinedCourses[cid].day, this.userDefinedCourses[cid].HHMMi);
    this.colors.push(colors[cid]);
    delete this.userDefinedCourses[cid];
    delete colors[cid];
    this.setState({});
  }

  downloadSchedule(){
    htmlToImage.toPng(document.getElementById('schedule'))
      .then(function (dataUrl) {
        downloadImage(dataUrl);
      });
  }

  renderCoursesList(){
    return(
      <VStack className='coursesList' bg="#FFFFFFEE" overflow='scroll' boxShadow='lg'>
        <Accordion width='full'>
          {Object.entries(this.courses).map(([code, course]) => {
            if(course.isVisible){
              return(
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box className='text3' flex='1' textAlign='left'>
                        {code} - {course.title}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <VStack direction='row' align='stretch'>
                      {Object.entries(course.groups).map(([num, group]) => (
                        <Button className='text3'
                                justifyContent='left'
                                fontSize='1.5vh'
                                height='4.5vh'
                                onClick={e => this.handleSelection(code, num)}
                                bg={e=>(code+num == this.state.selection.code+this.state.selection.num? '#a3e4d7': '#85c1e900')}
                                >
                          Grupo {num} - {group.prof}
                        </Button>
                        ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              )
            }
        })}
        </Accordion>
      </VStack>
    )
  }

  renderSelectedCoursesList(){
    const changeColor = (code, color) => {colors[code] = color; this.setState({})};
    return(
      <VStack className='selectedCourses' overflow='scroll' borderRadius='20' boxShadow='lg' bg="#FFFFFFEE">
        {Object.entries(this.selectedCourses).map(([code, group]) => (
          <HStack spacing={5}>
            <Popover>
              <PopoverTrigger>
                <Button bg={colors[code]} width={50} height={6}/>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverHeader> Elige un color </PopoverHeader>
                <PopoverCloseButton />
                <PopoverBody>
                  <SimpleGrid columns={10} spacing='2vh'>
                    {colorPool.map((color)=>{
                      return(
                        <Button bg={color} size='xs' onClick={e=>changeColor(code, color)}/>
                        )
                      })}
                  </SimpleGrid>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <Text className='text3' width='17vw'> {code} - {this.courses[code].shortTitle} </Text>
            <IconButton bg='#EF181640' icon={<CloseIcon/>} onClick={e => this.removeCourse(code, group)}/>
          </HStack>
        ))}
        <Divider />
        {Object.entries(this.userDefinedCourses).map(([cid, content]) => (
          <HStack spacing={5}>
            <Popover>
              <PopoverTrigger>
                <Button bg={colors[cid]} width={50} height={6}/>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverHeader> Elige un color </PopoverHeader>
                <PopoverCloseButton />
                <PopoverBody>
                  <SimpleGrid columns={10} spacing='2vh'>
                    {colorPool.map((color)=>{
                      return(
                        <Button bg={color} size='xs' onClick={e=>changeColor(cid, color)}/>
                        )
                      })}
                  </SimpleGrid>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <Text className='text3' width='17vw'> {content.title} </Text>
            <IconButton bg='#EF181640' icon={<CloseIcon/>} onClick={e => this.removeUserDefined(cid)}/>
          </HStack>
        ))}
      </VStack>
    )
  }

  renderSchedule(){
    const renderDayColumn = (day) => {
      return(
        <VStack>
          <Box className='text1' width={configs.wmax} height='4vh'> {dayName[day]} </Box>
          <Box position='relative' 
               width={configs.wmax} 
               height={configs.hmax} 
               bg='#FFFFFFEE'
               borderRadius='10'
               boxShadow='lg'
               >
            {Object.entries(this.schedule[day]).map(([code, node]) => {
              let [x, y, h, w] = node.info;
              if(node.userDefined){
                let [_, cid, __] = code.split('_');
                return(
                  <Card line1={this.userDefinedCourses[cid].code}
                        line2={this.userDefinedCourses[cid].title}
                        line3={this.userDefinedCourses[cid].room}
                        bg={get(colors, cid, '#12345650')}
                        x={x} 
                        y={y} 
                        w={w} 
                        h={h}
                        />
                        )
                      }
              code = code.split('_')[0];
              if(node.links.length != 0){
                return(
                  <Card line1={code}
                        line2={this.courses[code].groups[node.group].room}
                        bg={get(colors, code, '#12345650')}
                        x={x} 
                        y={y} 
                        w={w} 
                        h={h}
                        />
                )
              }
              return(
                <Card line1={code+' - G'+node.group}
                      line2={this.courses[code].shortTitle}
                      line3={this.courses[code].groups[node.group].room}
                      bg={get(colors, code, '#12345650')}
                      x={x} 
                      y={y} 
                      w={w} 
                      h={h}
                      />
              )
            })}
          </Box>
        </VStack>
      )
    }

    return(
      <HStack>
        <SchRange hmax={configs.hmax} wmax={'2vw'} hori={configs.hori} horf={configs.horf}/>
        {Object.keys(this.schedule).map((day) => (
          renderDayColumn(day)
        ))}
      </HStack>
    )
  }

  render(){  
    return (
      <div className="container">
        <Head>
          <title>Horario Bateria</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
            <HStack width='max' spacing='0px'>
              <VStack className="coursesContainer" spacing='1vh'>

                <Text fontSize='4vh'>
                  Asignaturas
                </Text>

                {this.renderCoursesList()}
                <Button width='25vw' height='5vh' fontSize='2vh' onClick={this.addToSelectedCourses} boxShadow='lg'>
                  Seleccionar curso
                </Button>

                {this.renderSelectedCoursesList()}
                <HStack height='5vh'>
                  <DrawerNewActivity onClickSave={this.addUserDefined}/>
                  <IconButton className='button1' onClick={this.downloadSchedule} icon={<DownloadIcon/>} />
                  <DrawerDaysLeft />
                </HStack>

              </VStack>
                
              <Box className='schFrame'>
                <VStack id='schedule' className='schedule' >

                  {this.renderSchedule()}

                </VStack>
              </Box>
            </HStack>
          
        </main>

      </div>
    );
    }
};

export default Main;
