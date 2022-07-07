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
} from "@chakra-ui/react";

import {CloseIcon} from "@chakra-ui/icons"
import {instanceOf} from 'prop-types'
import {withCookies, Cookies} from 'react-cookie' 
import {saveAs} from "file-saver";
import * as htmlToImage from 'html-to-image';

import _ScheduleSizeInitializer from "../components/_ScheduleSizeInitializer";
import CoursePanel from "../components/CoursePanel";
import Schedule from "../components/Schedule";
import TimeRemaining from "../components/TimeRemaining";

import data from "/public/data/asignaturas_v2.json"



var block2HHMM = {
  1: [[8,10], [9,40]],
  2: [[9,50], [11,20]],
  3: [[11,30], [13,0]],
  4: [[14,10], [15,40]],
  5: [[15,50], [17,20]],
  6: [[17,30], [19,0]]
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

function downloadImage(src){
  saveAs(src, 'image.jpg')
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
   
   this._idGenerator = cookies.get('id_count') || 0;
   this.courses = data;
   this.selectedCourses = cookies.get('selected') || {};
   this.userDefinedCourses = cookies.get('user_defined') || {};
    
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
    this.addUserDefined = this.addUserDefined.bind(this);
    this.downloadSchedule = this.downloadSchedule.bind(this);
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
      userDefined: userDefined,
      hori: HHMMi,
      horf: HHMMf
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
      cookies.set('available_colors', this.colors, {path: '/'});
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

    // Guardar en cookies
    const { cookies } = this.props;
    cookies.set('user_defined', this.userDefinedCourses, {path: '/'});
    cookies.set('graph', this.schedule, {path: '/'});
    cookies.set('colors', colors, {path: '/'});
    cookies.set('available_colors', this.colors, {path: '/'});
    cookies.set('id_count', this._idGenerator, {path: '/'});
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
    this.setState({selection: {code: '', num: ''}});

    // Quitar de cookies
    const { cookies } = this.props;
    cookies.set('selected', this.selectedCourses, {path: '/'});
    cookies.set('colors', colors, {path: '/'});
    cookies.set('available_colors', this.colors, {path: '/'});
  }

  removeUserDefined(cid){
    this.removeFromSchedule(this.userDefinedCourses[cid].code+'_'+cid, this.userDefinedCourses[cid].day, this.userDefinedCourses[cid].HHMMi);
    this.colors.push(colors[cid]);
    delete this.userDefinedCourses[cid];
    delete colors[cid];
    this.setState({});

    // Guardar en cookies
    const { cookies } = this.props;
    cookies.set('user_defined', this.userDefinedCourses, {path: '/'});
    cookies.set('colors', colors, {path: '/'});
    cookies.set('available_colors', this.colors, {path: '/'});
  }

  downloadSchedule(){
    document.getElementById('schedule')
    htmlToImage.toPng(document.getElementById('schedule'))
      .then(function (dataUrl) {
        downloadImage(dataUrl);
      });
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
    if((Object.keys(this.selectedCourses).length == 0) && (Object.keys(this.userDefinedCourses).length == 0)){
      return(
        <VStack className="selectedCoursesList">  
          <Text className="text2" paddingY={3}> Cursos Seleccionados </Text>
        </VStack>
      )
    }
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

        {Object.entries(this.userDefinedCourses).map(([cid, content]) => (
          <HStack className="selectedCourseLabel" spacing={5}>
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
            <Text className='text2' width={340}> {content.title} </Text>
            <IconButton bg='#EF181640' icon={<CloseIcon/>} onClick={e => this.removeUserDefined(cid)}/>
          </HStack>
        ))}
      </VStack>
    )
  }

  render(){  
    return (
      <div className="container">
        <main>
          <_ScheduleSizeInitializer configs={configs} autoReloadFunc={()=>this.setState({})}/>
          <HStack height='100%' width='100%' spacing='0px'>
            
            <CoursePanel renderCoursesList={this.renderCoursesList}
                         renderSelectedCoursesList={this.renderSelectedCoursesList}
                         addToSelectedCourses={this.addToSelectedCourses}
                         addUserDefined={this.addUserDefined}
                         downloader={this.downloadSchedule}
                         inputs={inputValues}
                         misc={miscellaneous}
                         configs={configs}
            />
            
            <Box className="scheduleLayout">
              <VStack id="schedule" className="schedule">
                <Text className="text3"> Horario Primer Semestre 2022 </Text>
                <Schedule 
                  schedule={this.schedule} 
                  courses={this.courses} 
                  userDefinedCourses={this.userDefinedCourses} 
                  configs={configs}
                  colors={colors}
                  />
              </VStack>
              <TimeRemaining lastDay={configs.lastDay}/> 
            </Box>
          </HStack>
          
        </main>

      </div>
    );
  }
};

export default withCookies(Main);
