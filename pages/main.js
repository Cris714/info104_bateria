//mantener datos:  cookies - local storage

import Head from "next/head";
import React from "react";
import {useState} from "react";
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
  Grid,
  GridItem,
  SimpleGrid,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverHeader,
  HStack,
  VStack,
  Text,
  Flex,
  Input,
} from "@chakra-ui/react";

import {AddIcon, CloseIcon} from "@chakra-ui/icons"

import data from "/public/data/asignaturas.json"


function get(object, key, default_value) {
  var result = object[key];
  return (typeof result !== "undefined") ? result : default_value;
}

const HiddenPopover=({style, onClickAdd, setName, dayNBlock})=>{
  return(
    <Popover>
      <PopoverTrigger>
        <IconButton style={style} icon={<AddIcon/>} size='xs' position='absolute' isRound/>
      </PopoverTrigger>
      <PopoverContent style={style}>
          <PopoverArrow />
          <PopoverHeader> Añadir manualmente </PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>
            <Input placeholder="Nombre" onChange={setName} isRequired/>
            <Input placeholder="Lugar"/>
            <Button onClick={e=>onClickAdd(dayNBlock)}> Agregar</Button>
          </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}


const Card=({courses, colors, onClickAdd, setName, dayNBlock})=>{
  // Tarjeta de curso para el horario

  const [style, setStyle] = useState({display: 'none'});

  if(courses.length == 1){
    let course = courses[0];
    return(
      <Flex justify='right' onMouseEnter={e => {setStyle({display: 'block'})}} onMouseLeave={e => {setStyle({display: 'none'})}}>
        <HiddenPopover style={style} onClickAdd={onClickAdd} setName={setName} dayNBlock={dayNBlock}/>
        <SimpleGrid columns={1} width='180px' height='70px'>
              <VStack bg={get(colors, course.code, "#FFFFFFAA")} 
                      spacing={0} 
                      overflow='hidden' 
                      borderRadius='20' 
                      justifyContent='center'
                      boxShadow='lg'
                      >
                <Text fontSize='sm'> {course.code} {course.group[0]}{course.group.split(" ")[1]} </Text>
                <Text fontSize='sm'> {course.title} </Text>
                <Text fontSize='sm'> {course.classroom} </Text>
              </VStack>
        </SimpleGrid>
      </Flex>
    );
  }
  return(
    <Flex justify='right' onMouseEnter={e => {setStyle({display: 'block'})}} onMouseLeave={e => {setStyle({display: 'none'})}}>
      <HiddenPopover style={style} />
      <SimpleGrid columns={courses.length} width='180px' height='70px'>
        {courses.map((course) => {
          return(
            <VStack bg={colors[course.code]} 
                      spacing={0} 
                      overflow='hidden' 
                      borderRadius='20' 
                      justifyContent='center'
                      boxShadow='lg'
                      >
              <Text fontSize='sm'> {course.code} </Text>
              <Text fontSize='sm'> {course.classroom} </Text>
            </VStack>
          )
        })}
      </SimpleGrid>
    </Flex>
  );
}


const EnrolledCourse=({course, colors, colorPool, onClickErase, onClickColor})=>{
  /*
  Tarjeta de curso para asignaturas inscritas, contiene un boton para eliminar el curso
  y otro para cambiar el color
  */
  return(
    <HStack spacing={5}>
      <Popover>
        <PopoverTrigger>
          <Button bg={colors[course.code]} width={50} height={6}/>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader> Elige un color </PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>
            <SimpleGrid columns={10} spacing={3}>
              {colorPool.map((color, index)=>{
                return(
                  <Button bg={color} size='xs' onClick={e=>onClickColor(course.code, color, index)}/>
                  )
                })}
            </SimpleGrid>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Text width={340}> {course.code} - {course.title} </Text>
      <IconButton bg='#EF181640' onClick={onClickErase} icon={<CloseIcon/>}/>
    </HStack>
  )
}



class Main extends React.Component{
  constructor(){
    super()
    this.day2num = {'lun': 1, 'mar': 2, 'mie': 3, 'jue': 4, 'vie': 5};
    this.num2day = {1: 'lun', 2: 'mar', 3: 'mie', 4: 'jue', 5: 'vie'};
    this.labels = ["Bloque", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    this.colorPool = ['#d98880', 
                      '#aab7b8',
                      '#ff8dfa', 
                      '#bb8fce', 
                      '#FF5733', 
                      '#FFC300', 
                      '#DAF7A6', 
                      '#85c1e9', 
                      '#a3e4d7',
                    ]
    this.blocks = [
      {num: "I", horas: "8:10 - 9:40"},
      {num: "II", horas: "9:50 - 11:20"},
      {num: "III", horas: "11:30 - 12:50"},
      {num: "IV", horas: "14:10 - 15:40"},
      {num: "V", horas: "15:50 - 17:20"},
      {num: "VI", horas: "17:30 - 18:50"}
    ];
    this.hidden = [];
    this.colors = {};

    this.state = {
      dummy: false,
      checkboxItemSelected: '',
      courses: data,
      tempCourse: null,
      tempMC: {name:'', room:''},
      tempCourseSch: [],
      schMatrix: [],
      enrolled: [],

    };

    for(let i = 0; i < this.blocks.length+1; i++){
      let temp = [];
      for(let j = 0; j < this.labels.length; j++){
        temp.push([{code:"",group:"",title:"",classroom:""},]);
      }
      this.state.schMatrix.push(temp);

      this.changeColor = this.changeColor.bind(this);
      this.setManuallyEnrolledName = this.setManuallyEnrolledName.bind(this);
      this.enrollManually = this.enrollManually.bind(this);
    }
  }

  // Setters
  setManuallyEnrolledName(event){
    this.state.tempMC.name = event.target.value;
  }

  // Funciones que manejan cambios
  handleChange(code, group, title, blocks, cid){
    let block, len;

    while((block=this.state.tempCourseSch.pop()) != null){
      len = this.state.schMatrix[block[1]][this.day2num[block[0]]].length;
      if(len > 1){
        this.state.schMatrix[block[1]][this.day2num[block[0]]].pop();
      }
      else{
        this.state.schMatrix[block[1]][this.day2num[block[0]]] = [{
          code: "",
          group: "",
          title: "",
          classroom: ""
        }]
      }
    }
    
    if(this.state.tempCourse != null){
      this.colorPool.push(this.colors[this.state.tempCourse.code]);
      delete this.colors[this.state.tempCourse.code];

      if(code+group == this.state.tempCourse.code+this.state.tempCourse.group){
        this.state.tempCourse = null
        this.setState({checkboxItemSelected: ''})
        return;
      }
    }

    this.state.tempCourse = {code: code, title: title, courseId: cid, group: group};
    this.colors[code] = this.colorPool.pop();


    blocks.map((block) => {
      if(this.state.schMatrix[block[1]][this.day2num[block[0]]][0].code == ""){
        this.state.schMatrix[block[1]][this.day2num[block[0]]].pop();
      }
      this.state.schMatrix[block[1]][this.day2num[block[0]]].push({
        code: code,
        group: group,
        title: title,
        classroom: "6302",
      })
      this.state.tempCourseSch.push(block);
    });

    this.setState({checkboxItemSelected: code+group})
  }

  enrollCourse(){
    if(this.state.tempCourse != null){
      this.state.enrolled.push({
        courseId: this.state.tempCourse.courseId,
        code: this.state.tempCourse.code,
        title: this.state.tempCourse.title,
        horarios: this.state.tempCourseSch,
        userDefined: false,
      });

      this.hidden.push(this.state.courses[this.state.tempCourse.courseId]);
      this.state.courses.splice(this.state.tempCourse.courseId, 1);
      this.state.tempCourse = null;
      this.state.tempCourseSch = [];
    }
    this.setState({dummy: true});
  }

  enrollManually(dayNBlock){
    if(this.state.tempMC.name != ''){
      this.state.enrolled.push({
        courseId: -1,
        code: '',
        title: this.state.tempMC.name,
        horarios: [[dayNBlock.day, dayNBlock.block]],
        userDefined: true,
      })
    }

    let len = this.state.schMatrix[dayNBlock.block][this.day2num[dayNBlock.day]].length;
    if(len > 1){
      this.state.schMatrix[dayNBlock.block][this.day2num[dayNBlock.day]].push({
        code: "",
        group: "",
        title: this.state.tempMC.name,
        classroom: ""
      });
    }
    else{
      this.state.schMatrix[dayNBlock.block][this.day2num[dayNBlock.day]] = [{
        code: "",
        group: "",
        title: this.state.tempMC.name,
        classroom: ""
      }]
    }

    this.setState({dummy: true})
  }

  removeCourse(courseId, index){
    let block, len, i;

    while((block=this.state.enrolled[index].horarios.pop()) != null){
      len = this.state.schMatrix[block[1]][this.day2num[block[0]]].length;

      for(i = 0; i < len; i++){
        if(this.state.schMatrix[block[1]][this.day2num[block[0]]][i].code == this.state.enrolled[index].code){
          break;
        }
      }

      if(len > 1){
        this.state.schMatrix[block[1]][this.day2num[block[0]]].splice(i, 1);
      }
      else{
        this.state.schMatrix[block[1]][this.day2num[block[0]]] = [{
          code: "",
          group: "",
          title: "",
          classroom: ""
        }]
      }
    }

    this.colorPool.push(this.colors[this.state.enrolled[index].code]);
    delete this.colors[this.state.enrolled[index].code];
    this.state.enrolled.splice(index, 1);
    this.state.courses.splice(courseId, 0, this.hidden[index]);
    this.hidden.splice(index, 1);
    this.setState({dummy: true});
  }

  changeColor(courseCode, color, index){
    this.colorPool.push(this.colors[courseCode]);
    this.colors[courseCode] = color;
    this.colorPool.splice(index, 1);
    this.setState({dummy: true});
  }

  renderCoursesList(){
    return(
      <VStack bg="#FFFFFFEE" overflow='scroll' height={460} width={500} boxShadow='lg'>
        <Accordion width={480}>
          {this.state.courses.map((item, cid) => (
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex='1' textAlign='left'>
                    {item.code} - {item.title}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
                <AccordionPanel pb={4}>
                    <VStack direction='row' align='stretch'>
                      {item.grupos.map((value, index) => {
                        return (
                          <Button onClick={e=>{this.handleChange(item.code, value, item.shortTitle, item.horario[index], cid)}}
                                  justifyContent='left'
                                  bg={e=>(item.code+value == this.state.checkboxItemSelected? '#a3e4d7': '#85c1e900')}
                                  size='sm'
                                  >
                            {value} - {item.profesores[index]}
                          </Button>
                        )
                      })}
                    </VStack>
                </AccordionPanel>
              </AccordionItem>
          ))}

        </Accordion>
      </VStack>
    )
  }

  renderSchedule(){
    let templateColumns = 'repeat('+(String)(2*this.labels.length-1)+', 1fr)'
    return (
      <Grid templateColumns={templateColumns} alignItems='center' justifyItems='center' rowGap={2}>
          {this.state.schMatrix.map((row, i) => {
            return(
              <>
                {row.map((item, j) =>{
                  if(i == 0 && j == 0){
                    return(
                      <GridItem colSpan={1}>
                        <VStack width='100px'>
                          <Text textAlign='center'>{this.labels[j]}</Text>
                        </VStack>
                      </GridItem>
                    )
                  }
                  if(i == 0){
                    return(
                      <GridItem colSpan={2}>
                        <VStack width='120px'>
                          <Text textAlign='center'>{this.labels[j]}</Text>
                        </VStack>
                      </GridItem>
                    )
                  }
                  if(j == 0){
                    return(
                      <GridItem colSpan={1}>
                        <VStack width='100px' spacing='0'>
                          <Text textAlign='center'>{this.blocks[i-1].num}</Text>
                          <Text textAlign='center'>{this.blocks[i-1].horas}</Text>
                        </VStack>
                      </GridItem>
                    )
                  }
                  return(
                    <GridItem colSpan={2}>
                      <Card courses={item} 
                            colors={this.colors} 
                            onClickAdd={this.enrollManually}
                            setName={this.setManuallyEnrolledName}
                            dayNBlock={{day: this.num2day[j], block: i}}
                            />
                    </GridItem>
                  )
                })}
              </>
            )
          })}
        
      </Grid>
    );
  }

  render(){  
    return (
      <div className="container">
        <Head>
          <title>Horario Bateria</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <VStack width='max'>
            <HStack width={1800} spacing={30}>
              <VStack>

                <Text fontSize={30}>
                  Asignaturas
                </Text>

                {this.renderCoursesList()}

                <Button width={500} onClick={e => this.enrollCourse()} boxShadow='lg'>
                  Seleccionar curso
                </Button>

                <Divider />

                <VStack height={250} width={500} overflow='scroll' borderRadius='20' boxShadow='lg' bg="#FFFFFFEE">
                  {this.state.enrolled.map((item, index) => {
                    return(
                      <EnrolledCourse course={item} 
                                      colors={this.colors} 
                                      colorPool={this.colorPool}
                                      onClickErase={e=>this.removeCourse(item.courseId, index)}
                                      onClickColor={this.changeColor}
                                      />
                    )
                  })}
                </VStack>

              </VStack>
                

              <VStack width={1250}>

                <Text fontSize={30}>
                  Horario
                </Text>

                {this.renderSchedule()}

                <VStack height={250} width={1200} bg='#12345610' borderWidth='3px'>
                </VStack>

              </VStack>
            </HStack>
          </VStack>
          
        </main>

      </div>
    );
  }
};

export default Main;
