import React from "react";
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
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverHeader,
  SimpleGrid,
} from "@chakra-ui/react";

import {AddIcon, CloseIcon} from "@chakra-ui/icons"
import {instanceOf} from 'prop-types'
import {withCookies, Cookies} from 'react-cookie' 
import {motion} from "framer-motion";
import {useState, useEffect, useRef} from "react";

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

var colors; // {KEY: courseCode, VALUE: color}

var configs = {
  'hmax': '70vh',
  'wmax': '11vw',
  'hori': [7, 0], // [HH, MM]
  'horf': [19, 0], // [HH, MM]
  'rangeStep': 60, // MM
  'includeSab': false,
  'includeDom': false,
  'lastDay': new Date('2022-07-15T23:59:59-04:00'),
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



const BoxDaysLeft = () => {
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
    console.log(window.innerHeight)
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
    <Box className="counterBox">
      <Text className="text4" fontSize='2vmax'>{timer}</Text> 
    </Box>
  )
}

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

const ScheduleWindowSizeInitializer = ({autoReloadFunc}) => {
  const setScheduleSize = (e) => {
    if(window.innerHeight < 400 || window.innerWidth < 400){
      configs.hmax = '460px';
      configs.wmax = '150px';
      autoReloadFunc();
    }
  }
  
  useEffect(() => {
    setScheduleSize(configs.lastDay);
  }, []);

  return(<></>)
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
          className='text4'
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
    range.push([asfmt(asHHMM(Math.round(i*step))), i*ystep-(hUnit=='px'? 9 : 1.5)]);
  }
  
  return(
    <VStack>
      <Box className="scheduleFRSeparator" align='center' width='1vw' fontSize='3vh' />
      <Box position='relative' width={wmax.toString()+wUnit} height={hmax.toString()+hUnit}>
        {range.map(([str, y]) => (
          <Text className='text2' position='absolute' right='0vw' top={y.toString()+hUnit}> {str} </Text>
        ))}
      </Box>
    </VStack>
  )
}



class Main extends React.Component{
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props){
    super(props);
    const {cookies} = props;

    //FLUSH COOKIES
    /*
    cookies.set('selected', {}, {path: '/'});
    cookies.set('graph', {'lun':{}, 'mar':{}, 'mie':{}, 'jue':{}, 'vie':{}}, {path: '/'});
    cookies.set('colors', {}, {path: '/'});
    cookies.set('available_colors', [...colorPool], {path: '/'})
    */

    this.courses = data;
    this.selectedCourses = cookies.get('selected') || {};
    
    this.colors = cookies.get('available_colors') || [...colorPool];
    colors = cookies.get('colors') || {};
    console.log(Object.keys(configs))

    // Almacena un grafo para cada dia: {KEY: courseCode, VALUE: {info: [x, y, h, w], links: [...aristas...], group: int}}
    this.schedule = cookies.get('graph') || {'lun':{}, 'mar':{}, 'mie':{}, 'jue':{}, 'vie':{}}; 

    this.state = {
      selection: {code: '', num: ''},
    };

    // Ajustes iniciales
    Object.keys(this.courses).map((course) => (this.courses[course]["isVisible"] = true));
    Object.keys(this.selectedCourses).map((course) => (this.courses[course].isVisible = false));

    // Binding
    this.addToSelectedCourses = this.addToSelectedCourses.bind(this);
    this.renderCoursesList = this.renderCoursesList.bind(this);
    this.renderSelectedCoursesList = this.renderSelectedCoursesList.bind(this);
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

    const { cookies } = this.props;
    cookies.set('graph', this.schedule, {path: '/'});
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
      const { cookies } = this.props;
      cookies.set('colors', colors, {path: '/'});
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

      // Guardar en cookies
      const { cookies } = this.props;
      cookies.set('selected', this.selectedCourses, {path: '/'});
      cookies.set('graph', this.schedule, {path: '/'});
      cookies.set('available_colors', this.colors), {path: '/'};
    }
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

    // Quitar de cookies
    const { cookies } = this.props;
    cookies.set('selected', this.selectedCourses, {path: '/'});
    cookies.set('colors', colors, {path: '/'});
    cookies.set('available_colors', this.colors, {path: '/'});
  }

  renderCoursesList(){
    return(
      <VStack className="coursesList">
        <Accordion width='100%' allowToggle>
          {Object.entries(this.courses).map(([code, course]) => {
            if(course.isVisible){
              return(
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box className="text2" flex='1' textAlign='left'>
                        {code} - {course.title}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <VStack direction='row' align='stretch'>
                      {Object.entries(course.groups).map(([num, group]) => (
                        <Button className="accordionButton"
                                justifyContent='left'
                                size='sm'
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
    const changeColor = (code, color) => {
      const { cookies } = this.props;
      colors[code] = color; 
      cookies.set('colors', colors, {path: '/'});
      this.setState({})
    };
    return(
      <VStack className="selectedCoursesList">
        {Object.entries(this.selectedCourses).map(([code, group]) => (
          <HStack className="selectedCourseLabel" spacing={5}>
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
            <Text className='text2' width={340}> {code} - {this.courses[code].shortTitle} </Text>
            <IconButton bg='#EF181640' icon={<CloseIcon/>} onClick={e => this.removeCourse(code, group)}/>
          </HStack>
        ))}
      </VStack>
    )
  }

  renderSchedule(){
    const renderDayColumn = (day) => {
      return(
        <VStack>
          <Box className='scheduleFRSeparator' width={configs.wmax}> {dayName[day]} </Box>
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
        <main>
          <ScheduleWindowSizeInitializer autoReloadFunc={()=>this.setState({})}/>
          <HStack height='100%' width='100%' spacing='0px'>
            
            <CoursePanel renderCoursesList={this.renderCoursesList}
                         renderSelectedCoursesList={this.renderSelectedCoursesList}
                         addToSelectedCourses={this.addToSelectedCourses}
            />
            
            <Box className="scheduleLayout">
              <VStack className="schedule">
                <Text className="text3"> Horario Primer Semestre 2022 </Text>
                {this.renderSchedule()}
              </VStack>
              <BoxDaysLeft /> 
            </Box>
          </HStack>
          
        </main>

      </div>
    );
  }
};

export default withCookies(Main);
