// import {AirTightnessUnit, DecarbonizationAssessment, spaceProgramNames} from "c-lib";

// export const decarbonizationAssessmentDownloadUnitConverter = (assessment: DecarbonizationAssessment) => {
//   //Unit conversion for space types values
//   if(typeof assessment.inputOCCalibration != "string") {
//     if(assessment.inputOCCalibration){
//       assessment.inputOCCalibration.spaceTypes = assessment.inputOCCalibration?.spaceTypes.map(s => {
//         if(s.name === spaceProgramNames.residentialSuite) {
//           if(s.ventilationPerSuite) s.ventilationPerSuite = s.ventilationPerSuite/(2.12*1000)
//         }else{
//           if(s.ventilationRatePerArea) s.ventilationRatePerArea = s.ventilationRatePerArea/1000
//           if(s.ventilationRatePerPerson) s.ventilationRatePerPerson = s.ventilationRatePerPerson/1000
//         }
//         return s;
//       })
//       if(assessment.inputOCCalibration.envelope){
//         assessment.inputOCCalibration.envelope.airTightness.map(a => {
//           if(a.airTightnessUnit === AirTightnessUnit.lSM2 && a.airTightnessValue){
//             if(typeof a.airTightnessValue === 'number'){
//               a.airTightnessValue = a.airTightnessValue/1000;
//             }else{
//               a.airTightnessValue = a.airTightnessValue.map(av => {
//                 av = av/1000;
//                 return av;
//               })
//             }
//           }
//           return a;
//         })
//       }
//     }
//   }

//   if(typeof assessment.inputOCUpgrade != "string") {
//     if(assessment.inputOCUpgrade){
//       assessment.inputOCUpgrade.spaceTypes = assessment.inputOCUpgrade?.spaceTypes.map(s => {
//         if(s.name === spaceProgramNames.residentialSuite) {
//           if(s.ventilationPerSuite) s.ventilationPerSuite = s.ventilationPerSuite/(2.12*1000)
//         }else{
//           if(s.ventilationRatePerArea) s.ventilationRatePerArea = s.ventilationRatePerArea/1000
//           if(s.ventilationRatePerPerson) s.ventilationRatePerPerson = s.ventilationRatePerPerson/1000
//         }
//         return s;
//       })
//       if(assessment.inputOCUpgrade.envelope){
//         assessment.inputOCUpgrade.envelope.airTightness.map(a => {
//           if(a.airTightnessUnit === AirTightnessUnit.lSM2 && a.airTightnessValue){
//             if(typeof a.airTightnessValue === 'number'){
//               a.airTightnessValue = a.airTightnessValue/1000;
//             }else{
//               a.airTightnessValue = a.airTightnessValue.map(av => {
//                 av = av/1000;
//                 return av;
//               })
//             }
//           }
//           return a;
//         })
//       }
//     }
//   }
//   return assessment;
// }

