import React from "react";
import {Box, HStack, VStack} from "@chakra-ui/react";
import Card from "./Card";
import ScheduleRange from "./ScheduleRange";



var dayName = {
  'lun': 'Lunes',
  'mar': 'Martes',
  'mie': 'Miércoles',
  'jue': 'Jueves',
  'vie': 'Viernes',
  'sab': 'Sábado',
  'dom': 'Domingo'
}

var block2HHMM = {
  1: [[8,10], [9,40]],
  2: [[9,50], [11,20]],
  3: [[11,30], [13,0]],
  4: [[14,10], [15,40]],
  5: [[15,50], [17,20]],
  6: [[17,30], [19,0]]
}



function get(object, key, default_value) {
  var result = object[key];
  return (typeof result !== "undefined") ? result : default_value;
}



const Schedule = ({schedule, courses, userDefinedCourses, configs, colors}) => {
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
          {Object.entries(schedule[day]).map(([code, node]) => {
            let [x, y, h, w] = node.info;
            if(node.userDefined){
              let [_, cid, __] = code.split('_');
              return(
                <Card line1={userDefinedCourses[cid].code}
                      line2={userDefinedCourses[cid].title}
                      line3={userDefinedCourses[cid].room}
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
                      line2={courses[code].groups[node.group].room}
                      bg={get(colors, code, '#12345650')}
                      x={x} 
                      y={y} 
                      w={w} 
                      h={h}
                      hori={node.hori}
                      horf={node.horf}
                      />
              )
            }
            return(
              <Card line1={code+' - G'+node.group}
                    line2={courses[code].shortTitle}
                    line3={courses[code].groups[node.group].room}
                    bg={get(colors, code, '#12345650')}
                    x={x} 
                    y={y} 
                    w={w} 
                    h={h}
                    hori={node.hori}
                    horf={node.horf}
                    />
            )
          })}
        </Box>
      </VStack>
    )
  }

  return(
    <HStack>
      <ScheduleRange 
        hmax={configs.hmax} 
        wmax={'2vw'} 
        hori={configs.hori} 
        horf={configs.horf}
        rangeStep={configs.rangeStep}
      />
      {Object.keys(schedule).map((day) => (
        renderDayColumn(day)
      ))}
    </HStack>
  )
}

export default Schedule;