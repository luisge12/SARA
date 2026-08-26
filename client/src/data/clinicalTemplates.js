// Catálogo de Plantillas Clínicas y Sugerencias de Autocompletado por Especialidad Médica para SARA

export const COMMON_SPECIALTIES = [
  'Alergología e Inmunología Clínica',
  'Anatomía Patológica',
  'Anestesiología y Reanimación',
  'Angiología y Cirugía Vascular',
  'Cardiología',
  'Cardiología Intervencionista',
  'Cirugía Bariatrica y Metabólica',
  'Cirugía Cardiovascular',
  'Cirugía Colorrectal / Coloproctología',
  'Cirugía General',
  'Cirugía Maxilofacial',
  'Cirugía Oncológica',
  'Cirugía Pediátrica',
  'Cirugía Plástica, Reconstructiva y Estética',
  'Cirugía Torácica',
  'Cirugía Vascular y Endovascular',
  'Coloproctología',
  'Dermatología',
  'Endocrinología y Metabolismo',
  'Endodoncia (Odontología)',
  'Fisiatría / Medicina Física y Rehabilitación',
  'Gastroenterología y Hepatología',
  'Genética Médica',
  'Geriatría',
  'Ginecología y Obstetricia',
  'Ginecología Oncológica',
  'Hematología',
  'Infectología',
  'Mastología / Senología',
  'Medicina de Emergencias y Desastres',
  'Medicina del Deporte',
  'Medicina Estética',
  'Medicina Familiar y Comunitaria',
  'Medicina General',
  'Medicina Intensiva / Cuidados Intensivos',
  'Medicina Interna',
  'Medicina Legal y Forense',
  'Medicina Nuclear',
  'Medicina Ocupacional y del Trabajo',
  'Medicina Paliativa y Dolor',
  'Nefrología',
  'Neonatología',
  'Neumonología / Neumología',
  'Neurocirugía',
  'Neurología',
  'Nutrición y Dietética Clínica',
  'Obstetricia',
  'Oftalmología',
  'Oncología Médica',
  'Oncología Radioterápica',
  'Ortopedia y Traumatología',
  'Otorrinolaringología',
  'Pediatría',
  'Perinatología y Medicina Materno-Fetal',
  'Podología Médica',
  'Psiquiatría',
  'Psicología Clínica',
  'Radiología e Imagenología',
  'Radiología Intervencionista',
  'Reumatología',
  'Sexología Médica',
  'Toxicología Médica',
  'Traumatología',
  'Urología'
];

export const COMMON_SYMPTOMS = [
  'Dolor agudo',
  'Dolor punzante',
  'Ardor / Parestesia',
  'Sangrado / Rectorragia',
  'Sangrado dig. alto (Melena)',
  'Prurito / Picazón',
  'Secreción purulenta',
  'Masa / Tumoración palpable',
  'Fiebre / Febrícula',
  'Estreñimiento / Constipación',
  'Diarrea / Evacuaciones líquidas',
  'Distensión abdominal / Meteorismo',
  'Plenitud postprandial / Epigastralgia',
  'Nausea / Vómitos',
  'Tos seca / Productiva',
  'Dyspnea / Dificultad respiratoria',
  'Cefalea / Mareos'
];

export const COMMON_DIAGNOSES = [
  'Enfermedad Hemorroidal Grado I',
  'Enfermedad Hemorroidal Grado II',
  'Enfermedad Hemorroidal Grado III',
  'Enfermedad Hemorroidal Grado IV',
  'Fisura Anal Aguda',
  'Fisura Anal Crónica',
  'Absceso Perianal',
  'Fístula Perianal Interesfinteriana',
  'Poliposis Colónica / Rectal',
  'Adenocarcinoma de Recto (Cáncer)',
  'Adenocarcinoma de Colon (Cáncer)',
  'Gastritis Eritematosa Antral',
  'Síndrome de Intestino Irritable (SII)',
  'Reflujo Gastroesofágico (ERGE)',
  'Hipertensión Arterial Sistémica (HTA)',
  'Diabetes Mellitus Tipo 2',
  'Infección Respiratoria Aguda (IRA)',
  'Infección del Tracto Urinario (ITU)',
  'Vaginosis Bacteriana',
  'Candidiasis Vulvovaginal'
];

export const COMMON_MEDICATIONS = [
  'Diosmina + Hesperidina (Flavonoides)',
  'Diltiazem en gel 2%',
  'Nitroglicerina en ungüento 0.2%',
  'Lidocaína + Hidrocortisona pomada',
  'Plantago Ovata / Psyllium (Fibra)',
  'Omeprazol / Esomeprazol',
  'Trimebutina / Bromuro de Pinaverio',
  'Ibuprofeno / Ketoprofeno',
  'Paracetamol / Acetaminofén',
  'Ciprofloxacina / Levofloxacina',
  'Metronidazol',
  'Amoxicilina + Ácido Clavulánico',
  'Losartán potásico / Amlodipina',
  'Metformina'
];

export const COMMON_PRESENTATIONS = [
  'Comprimidos 500 mg',
  'Cápsulas 20 mg',
  'Gel tópico 30 g',
  'Pomada rectal 20 g',
  'Polvo para suspensión oral',
  'Jarabe 120 mL',
  'Óvulos vaginales',
  'Solución inyectable 5 mL'
];

export const CLINICAL_TEMPLATES = [
  {
    id: 'coloproctologia_hemorroides',
    specialty: 'Coloproctología',
    name: 'Enfermedad Hemorroidal (Grado II - III)',
    description: 'Rectorragia brillante post-defecatoria y prolapso reducida espontáneamente o manual.',
    reasonForVisit: [
      {
        onset: '3 semanas',
        symptom: 'Sangrado',
        complement: 'Rectorragia brillante al defecar',
        regionGeneral: 'Región Anal',
        regionSpecific: 'Conducto anal',
        relatedTo: 'Defecación y esfuerzo físico',
        additionalInfo: 'Sensación de masa o prolapso'
      }
    ],
    physicalInspection: 'A la inspección estática y dinámica perianal se aprecian paquetes hemorroidales prolapsados en hora 3 y 7, con signos de congestión vascular sin trombosis evidente.',
    physicalPalpation: 'Región perianal blanda, depresible, no dolorosa a la palpación superficial.',
    rectalExamination: 'Tacto rectal con esfínter anal normotónico. Paquetes vasculares internos prominentes a la palpación digital.',
    anoscopy: 'Anoscopia: Muestra engrosamiento y congestión de la mucosa anal en paquetes primarios con prolapso a la maniobra de Valsalva.',
    diagnoses: [
      {
        diagnosis: 'Enfermedad Hemorroidal Grado II-III',
        classification: 'Mixta (Interna y Externa)',
        complication: 'Congestión vascular',
        histologicType: '',
        stage: ''
      }
    ],
    treatmentPlan: [
      {
        medication: 'Diosmina + Hesperidina (Flavonoides)',
        presentation: 'Comprimidos 500 mg',
        indication: 'Tomar 1 comprimido cada 12 horas con las comidas',
        duration: '14 días'
      },
      {
        medication: 'Plantago Ovata (Fibra dietética)',
        presentation: 'Sobres 3.5 g',
        indication: 'Disolver 1 sobre en abundante agua cada 24 horas',
        duration: '30 días'
      },
      {
        medication: 'Baños de Asiento',
        presentation: 'Agua tibia limpia',
        indication: 'Baños de asiento durante 10-15 minutos tras la evacuación',
        duration: '10 días'
      }
    ],
    evolutionaryReport: 'Paciente acude por cuadro de enfermedad hemorroidal con buena respuesta esperada a tratamiento médico y conservador. Se indican pautas dietéticas y seguimiento en 15 días.'
  },
  {
    id: 'coloproctologia_fisura',
    specialty: 'Coloproctología',
    name: 'Fisura Anal Aguda / Crónica',
    description: 'Dolor intenso lacerante durante y posterior a la defecación.',
    reasonForVisit: [
      {
        onset: '1 mes',
        symptom: 'Dolor',
        complement: 'Intenso post-defecatorio tipo lacerante',
        regionGeneral: 'Región Anal',
        regionSpecific: 'Línea media posterior',
        relatedTo: 'Evacuación de heces duras',
        additionalInfo: 'Escaso sangrado en rasurado en papel'
      }
    ],
    physicalInspection: 'Inspección anal con separación suave de nalgas evidencia solución de continuidad (ulceración lineal) en línea media posterior anal.',
    physicalPalpation: 'Palpación perianal desencadena molestia en cuadrante posterior.',
    rectalExamination: 'Hypertonía del esfínter anal interno evidente. Tacto diferido o realizado con xilocaína gel por dolor.',
    anoscopy: 'Anoscopia diferida / visualización de hipertonía esfinteriana.',
    diagnoses: [
      {
        diagnosis: 'Fisura Anal Crónica',
        classification: 'Posterior central',
        complication: 'Hipertonía del esfínter anal interno',
        histologicType: '',
        stage: ''
      }
    ],
    treatmentPlan: [
      {
        medication: 'Diltiazem en gel 2%',
        presentation: 'Tubo gel 30 g',
        indication: 'Aplicar una pequeña cantidad perianal cada 12 horas',
        duration: '6 a 8 semanas'
      },
      {
        medication: 'Paracetamol / Acetaminofén',
        presentation: 'Comprimidos 500 mg',
        indication: 'Tomar 1 comprimido cada 8 horas si hay dolor',
        duration: '7 días'
      }
    ],
    evolutionaryReport: 'Cuadro compatible con fisura anal. Se inicia esfinterotomía química conservadora (Diltiazem tópica) para relajar el esfínter interno.'
  },
  {
    id: 'coloproctologia_cancer',
    specialty: 'Coloproctología',
    name: 'Evaluación Oncológica Rectal / Colorrectal',
    description: 'Plantilla para hallazgos con diagnóstico tumoral o cáncer rectal/colon.',
    reasonForVisit: [
      {
        onset: '4 meses',
        symptom: 'Sangrado',
        complement: 'Mezclado con las heces y tenesmo rectal',
        regionGeneral: 'Abdomen / Recto',
        regionSpecific: 'Ampolla rectal',
        relatedTo: 'Cambios en hábito evacratorio',
        additionalInfo: 'Pérdida ponderal de 5 kg'
      }
    ],
    physicalInspection: 'Paciente clínicamente estable, normocoloreado, abdomen blando no doloroso.',
    physicalPalpation: 'Abdomen sin masas ni megalias palpables.',
    rectalExamination: 'Tacto rectal: A 5 cm del margen anal se palpa lesión vegetante, indurada, ulcerada en cara posterior que ocupa el 30% de la circunferencia.',
    anoscopy: 'Visualización de masa tumoral friable con sangrado al contacto.',
    diagnoses: [
      {
        diagnosis: 'Adenocarcinoma de Recto (Cáncer)',
        classification: 'Lesión vegetante e indurada ampolla rectal media',
        complication: 'Estenosis parcial del lumen',
        histologicType: 'Adenocarcinoma tubular bien diferenciado',
        stage: 'Estadio IIB (T3N0M0)'
      }
    ],
    treatmentPlan: [
      {
        medication: 'Videocolonoscopia Completa + Biopsia',
        presentation: 'Estudio endoscópico',
        indication: 'Tomar muestra histopatológica de lesión y evaluar colon proximal',
        duration: 'Prioritario (72 hrs)'
      },
      {
        medication: 'TC Tomografía de Tórax, Abdomen y Pelvis con contraste',
        presentation: 'Estudio de imagen',
        indication: 'Estadificación sistémica y nodal',
        duration: 'Urgente'
      }
    ],
    evolutionaryReport: 'Hallazgo de masa rectal sospechosa. Se toman muestras para estudio histopatológico prioritario y se solicita estadificación por imágenes para conducta quirúrgica/oncológica multidisicplinaria.'
  },
  {
    id: 'gastro_gastritis',
    specialty: 'Gastroenterología y Hepatología',
    name: 'Gastritis Crónica / Síndrome Dispéptico',
    description: 'Epigastralgia, pirosis y saciedad precoz.',
    reasonForVisit: [
      {
        onset: '2 meses',
        symptom: 'Ardor',
        complement: 'Epigastralgia y pirosis retroesternal',
        regionGeneral: 'Abdomen Superior',
        regionSpecific: 'Epigastrio',
        relatedTo: 'Ingesta de alimentos irritantes y ayuno',
        additionalInfo: 'Nauseas ocasionales'
      }
    ],
    physicalInspection: 'Abdomen simétrico, no distendido.',
    physicalPalpation: 'Dolor a la palpación profunda en epigastrio. Sin signos de irritación peritoneal.',
    rectalExamination: 'No realizado / No amerita en la evaluación inicial.',
    anoscopy: 'N/A',
    diagnoses: [
      {
        diagnosis: 'Gastritis Eritematosa Antral',
        classification: 'Dispepsia tipo ulcerosa',
        complication: 'Infección por Helicobacter pylori a descartar',
        histologicType: '',
        stage: ''
      }
    ],
    treatmentPlan: [
      {
        medication: 'Esomeprazol',
        presentation: 'Cápsulas 40 mg',
        indication: 'Tomar 1 cápsula en ayunas 30 min antes del desayuno',
        duration: '28 días'
      },
      {
        medication: 'Endoscopia Digestiva Superior (EDS)',
        presentation: 'Estudio endoscópico con biopsia',
        indication: 'Evaluación de mucosa gástrica y test de ureasa H. pylori',
        duration: 'Programado'
      }
    ],
    evolutionaryReport: 'Paciente con dispepsia gástrica. Se inicia tratamiento con IBP y se solicita estudio endoscópico digestivo superior.'
  },
  {
    id: 'medicina_general_hta',
    specialty: 'Medicina General',
    name: 'Evaluación Cardiovascular / HTA Control',
    description: 'Control de presión arterial y factores de riesgo.',
    reasonForVisit: [
      {
        onset: '2 semanas',
        symptom: 'Cefalea',
        complement: 'Holocraneana matutina y mareos',
        regionGeneral: 'Cabeza / General',
        regionSpecific: 'Región occipital',
        relatedTo: 'Cifras tensionales elevadas',
        additionalInfo: 'Antecedentes familiares de HTA'
      }
    ],
    physicalInspection: 'Paciente lucido, orientado en tiempo, espacio y persona.',
    physicalPalpation: 'Campos pulmonares libres y bien ventilados. Ruidos cardíacos rítmicos sin soplos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [
      {
        diagnosis: 'Hipertensión Arterial Sistémica (HTA)',
        classification: 'Estadío 1 esencial',
        complication: 'Ninguna evidenciada',
        histologicType: '',
        stage: ''
      }
    ],
    treatmentPlan: [
      {
        medication: 'Losartán Potásico',
        presentation: 'Comprimidos 50 mg',
        indication: 'Tomar 1 comprimido cada 24 horas por las mañanas',
        duration: 'Continuo'
      },
      {
        medication: 'Perfil 20 y Mapa de Presión Arterial',
        presentation: 'Laboratorio / Monitoreo',
        indication: 'Realizar exámenes de sangre y registro tensional 24 hrs',
        duration: 'Próxima consulta'
      }
    ],
    evolutionaryReport: 'Se inicia tratamiento antihipertensivo oral. Se recomiendan hábitos de vida saludable, dieta hiposódica y control tensional diario.'
  },
  {
    id: 'tmpl_alergolog_a_e_inmuno',
    specialty: 'Alergología e Inmunología Clínica',
    name: 'Consulta Integral - Alergología e Inmunología Clínica',
    description: 'Plantilla de evaluación general adaptada para Alergología e Inmunología Clínica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_anatom_a_patol_gica',
    specialty: 'Anatomía Patológica',
    name: 'Consulta Integral - Anatomía Patológica',
    description: 'Plantilla de evaluación general adaptada para Anatomía Patológica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_anestesiolog_a_y_rea',
    specialty: 'Anestesiología y Reanimación',
    name: 'Consulta Integral - Anestesiología y Reanimación',
    description: 'Plantilla de evaluación general adaptada para Anestesiología y Reanimación.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_angiolog_a_y_cirug_a',
    specialty: 'Angiología y Cirugía Vascular',
    name: 'Consulta Integral - Angiología y Cirugía Vascular',
    description: 'Plantilla de evaluación general adaptada para Angiología y Cirugía Vascular.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cardiolog_a',
    specialty: 'Cardiología',
    name: 'Consulta Integral - Cardiología',
    description: 'Plantilla de evaluación general adaptada para Cardiología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cardiolog_a_interven',
    specialty: 'Cardiología Intervencionista',
    name: 'Consulta Integral - Cardiología Intervencionista',
    description: 'Plantilla de evaluación general adaptada para Cardiología Intervencionista.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cirug_a_bariatrica_y',
    specialty: 'Cirugía Bariatrica y Metabólica',
    name: 'Consulta Integral - Cirugía Bariatrica y Metabólica',
    description: 'Plantilla de evaluación general adaptada para Cirugía Bariatrica y Metabólica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cirug_a_cardiovascul',
    specialty: 'Cirugía Cardiovascular',
    name: 'Consulta Integral - Cirugía Cardiovascular',
    description: 'Plantilla de evaluación general adaptada para Cirugía Cardiovascular.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cirug_a_colorrectal_',
    specialty: 'Cirugía Colorrectal / Coloproctología',
    name: 'Consulta Integral - Cirugía Colorrectal / Coloproctología',
    description: 'Plantilla de evaluación general adaptada para Cirugía Colorrectal / Coloproctología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cirug_a_general',
    specialty: 'Cirugía General',
    name: 'Consulta Integral - Cirugía General',
    description: 'Plantilla de evaluación general adaptada para Cirugía General.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cirug_a_maxilofacial',
    specialty: 'Cirugía Maxilofacial',
    name: 'Consulta Integral - Cirugía Maxilofacial',
    description: 'Plantilla de evaluación general adaptada para Cirugía Maxilofacial.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cirug_a_oncol_gica',
    specialty: 'Cirugía Oncológica',
    name: 'Consulta Integral - Cirugía Oncológica',
    description: 'Plantilla de evaluación general adaptada para Cirugía Oncológica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cirug_a_pedi_trica',
    specialty: 'Cirugía Pediátrica',
    name: 'Consulta Integral - Cirugía Pediátrica',
    description: 'Plantilla de evaluación general adaptada para Cirugía Pediátrica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cirug_a_pl_stica__re',
    specialty: 'Cirugía Plástica, Reconstructiva y Estética',
    name: 'Consulta Integral - Cirugía Plástica, Reconstructiva y Estética',
    description: 'Plantilla de evaluación general adaptada para Cirugía Plástica, Reconstructiva y Estética.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cirug_a_tor_cica',
    specialty: 'Cirugía Torácica',
    name: 'Consulta Integral - Cirugía Torácica',
    description: 'Plantilla de evaluación general adaptada para Cirugía Torácica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_cirug_a_vascular_y_e',
    specialty: 'Cirugía Vascular y Endovascular',
    name: 'Consulta Integral - Cirugía Vascular y Endovascular',
    description: 'Plantilla de evaluación general adaptada para Cirugía Vascular y Endovascular.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_dermatolog_a',
    specialty: 'Dermatología',
    name: 'Consulta Integral - Dermatología',
    description: 'Plantilla de evaluación general adaptada para Dermatología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_endocrinolog_a_y_met',
    specialty: 'Endocrinología y Metabolismo',
    name: 'Consulta Integral - Endocrinología y Metabolismo',
    description: 'Plantilla de evaluación general adaptada para Endocrinología y Metabolismo.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_endodoncia__odontolo',
    specialty: 'Endodoncia (Odontología)',
    name: 'Consulta Integral - Endodoncia (Odontología)',
    description: 'Plantilla de evaluación general adaptada para Endodoncia (Odontología).',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_fisiatr_a___medicina',
    specialty: 'Fisiatría / Medicina Física y Rehabilitación',
    name: 'Consulta Integral - Fisiatría / Medicina Física y Rehabilitación',
    description: 'Plantilla de evaluación general adaptada para Fisiatría / Medicina Física y Rehabilitación.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_gen_tica_m_dica',
    specialty: 'Genética Médica',
    name: 'Consulta Integral - Genética Médica',
    description: 'Plantilla de evaluación general adaptada para Genética Médica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_geriatr_a',
    specialty: 'Geriatría',
    name: 'Consulta Integral - Geriatría',
    description: 'Plantilla de evaluación general adaptada para Geriatría.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_ginecolog_a_y_obstet',
    specialty: 'Ginecología y Obstetricia',
    name: 'Consulta Integral - Ginecología y Obstetricia',
    description: 'Plantilla de evaluación general adaptada para Ginecología y Obstetricia.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_ginecolog_a_oncol_gi',
    specialty: 'Ginecología Oncológica',
    name: 'Consulta Integral - Ginecología Oncológica',
    description: 'Plantilla de evaluación general adaptada para Ginecología Oncológica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_hematolog_a',
    specialty: 'Hematología',
    name: 'Consulta Integral - Hematología',
    description: 'Plantilla de evaluación general adaptada para Hematología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_infectolog_a',
    specialty: 'Infectología',
    name: 'Consulta Integral - Infectología',
    description: 'Plantilla de evaluación general adaptada para Infectología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_mastolog_a___senolog',
    specialty: 'Mastología / Senología',
    name: 'Consulta Integral - Mastología / Senología',
    description: 'Plantilla de evaluación general adaptada para Mastología / Senología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_medicina_de_emergenc',
    specialty: 'Medicina de Emergencias y Desastres',
    name: 'Consulta Integral - Medicina de Emergencias y Desastres',
    description: 'Plantilla de evaluación general adaptada para Medicina de Emergencias y Desastres.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_medicina_del_deporte',
    specialty: 'Medicina del Deporte',
    name: 'Consulta Integral - Medicina del Deporte',
    description: 'Plantilla de evaluación general adaptada para Medicina del Deporte.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_medicina_est_tica',
    specialty: 'Medicina Estética',
    name: 'Consulta Integral - Medicina Estética',
    description: 'Plantilla de evaluación general adaptada para Medicina Estética.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_medicina_familiar_y_',
    specialty: 'Medicina Familiar y Comunitaria',
    name: 'Consulta Integral - Medicina Familiar y Comunitaria',
    description: 'Plantilla de evaluación general adaptada para Medicina Familiar y Comunitaria.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_medicina_intensiva__',
    specialty: 'Medicina Intensiva / Cuidados Intensivos',
    name: 'Consulta Integral - Medicina Intensiva / Cuidados Intensivos',
    description: 'Plantilla de evaluación general adaptada para Medicina Intensiva / Cuidados Intensivos.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_medicina_interna',
    specialty: 'Medicina Interna',
    name: 'Consulta Integral - Medicina Interna',
    description: 'Plantilla de evaluación general adaptada para Medicina Interna.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_medicina_legal_y_for',
    specialty: 'Medicina Legal y Forense',
    name: 'Consulta Integral - Medicina Legal y Forense',
    description: 'Plantilla de evaluación general adaptada para Medicina Legal y Forense.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_medicina_nuclear',
    specialty: 'Medicina Nuclear',
    name: 'Consulta Integral - Medicina Nuclear',
    description: 'Plantilla de evaluación general adaptada para Medicina Nuclear.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_medicina_ocupacional',
    specialty: 'Medicina Ocupacional y del Trabajo',
    name: 'Consulta Integral - Medicina Ocupacional y del Trabajo',
    description: 'Plantilla de evaluación general adaptada para Medicina Ocupacional y del Trabajo.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_medicina_paliativa_y',
    specialty: 'Medicina Paliativa y Dolor',
    name: 'Consulta Integral - Medicina Paliativa y Dolor',
    description: 'Plantilla de evaluación general adaptada para Medicina Paliativa y Dolor.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_nefrolog_a',
    specialty: 'Nefrología',
    name: 'Consulta Integral - Nefrología',
    description: 'Plantilla de evaluación general adaptada para Nefrología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_neonatolog_a',
    specialty: 'Neonatología',
    name: 'Consulta Integral - Neonatología',
    description: 'Plantilla de evaluación general adaptada para Neonatología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_neumonolog_a___neumo',
    specialty: 'Neumonología / Neumología',
    name: 'Consulta Integral - Neumonología / Neumología',
    description: 'Plantilla de evaluación general adaptada para Neumonología / Neumología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_neurocirug_a',
    specialty: 'Neurocirugía',
    name: 'Consulta Integral - Neurocirugía',
    description: 'Plantilla de evaluación general adaptada para Neurocirugía.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_neurolog_a',
    specialty: 'Neurología',
    name: 'Consulta Integral - Neurología',
    description: 'Plantilla de evaluación general adaptada para Neurología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_nutrici_n_y_diet_tic',
    specialty: 'Nutrición y Dietética Clínica',
    name: 'Consulta Integral - Nutrición y Dietética Clínica',
    description: 'Plantilla de evaluación general adaptada para Nutrición y Dietética Clínica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_obstetricia',
    specialty: 'Obstetricia',
    name: 'Consulta Integral - Obstetricia',
    description: 'Plantilla de evaluación general adaptada para Obstetricia.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_oftalmolog_a',
    specialty: 'Oftalmología',
    name: 'Consulta Integral - Oftalmología',
    description: 'Plantilla de evaluación general adaptada para Oftalmología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_oncolog_a_m_dica',
    specialty: 'Oncología Médica',
    name: 'Consulta Integral - Oncología Médica',
    description: 'Plantilla de evaluación general adaptada para Oncología Médica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_oncolog_a_radioter_p',
    specialty: 'Oncología Radioterápica',
    name: 'Consulta Integral - Oncología Radioterápica',
    description: 'Plantilla de evaluación general adaptada para Oncología Radioterápica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_ortopedia_y_traumato',
    specialty: 'Ortopedia y Traumatología',
    name: 'Consulta Integral - Ortopedia y Traumatología',
    description: 'Plantilla de evaluación general adaptada para Ortopedia y Traumatología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_otorrinolaringolog_a',
    specialty: 'Otorrinolaringología',
    name: 'Consulta Integral - Otorrinolaringología',
    description: 'Plantilla de evaluación general adaptada para Otorrinolaringología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_pediatr_a',
    specialty: 'Pediatría',
    name: 'Consulta Integral - Pediatría',
    description: 'Plantilla de evaluación general adaptada para Pediatría.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_perinatolog_a_y_medi',
    specialty: 'Perinatología y Medicina Materno-Fetal',
    name: 'Consulta Integral - Perinatología y Medicina Materno-Fetal',
    description: 'Plantilla de evaluación general adaptada para Perinatología y Medicina Materno-Fetal.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_podolog_a_m_dica',
    specialty: 'Podología Médica',
    name: 'Consulta Integral - Podología Médica',
    description: 'Plantilla de evaluación general adaptada para Podología Médica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_psiquiatr_a',
    specialty: 'Psiquiatría',
    name: 'Consulta Integral - Psiquiatría',
    description: 'Plantilla de evaluación general adaptada para Psiquiatría.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_psicolog_a_cl_nica',
    specialty: 'Psicología Clínica',
    name: 'Consulta Integral - Psicología Clínica',
    description: 'Plantilla de evaluación general adaptada para Psicología Clínica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_radiolog_a_e_imageno',
    specialty: 'Radiología e Imagenología',
    name: 'Consulta Integral - Radiología e Imagenología',
    description: 'Plantilla de evaluación general adaptada para Radiología e Imagenología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_radiolog_a_intervenc',
    specialty: 'Radiología Intervencionista',
    name: 'Consulta Integral - Radiología Intervencionista',
    description: 'Plantilla de evaluación general adaptada para Radiología Intervencionista.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_reumatolog_a',
    specialty: 'Reumatología',
    name: 'Consulta Integral - Reumatología',
    description: 'Plantilla de evaluación general adaptada para Reumatología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_sexolog_a_m_dica',
    specialty: 'Sexología Médica',
    name: 'Consulta Integral - Sexología Médica',
    description: 'Plantilla de evaluación general adaptada para Sexología Médica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_toxicolog_a_m_dica',
    specialty: 'Toxicología Médica',
    name: 'Consulta Integral - Toxicología Médica',
    description: 'Plantilla de evaluación general adaptada para Toxicología Médica.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_traumatolog_a',
    specialty: 'Traumatología',
    name: 'Consulta Integral - Traumatología',
    description: 'Plantilla de evaluación general adaptada para Traumatología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
  {
    id: 'tmpl_urolog_a',
    specialty: 'Urología',
    name: 'Consulta Integral - Urología',
    description: 'Plantilla de evaluación general adaptada para Urología.',
    reasonForVisit: [{
      onset: '1 semana',
      symptom: 'Evaluación / Control',
      complement: 'Consulta de seguimiento',
      regionGeneral: 'General',
      regionSpecific: '',
      relatedTo: '',
      additionalInfo: 'Paciente acude para revisión por su especialista.'
    }],
    physicalInspection: 'Paciente en buenas condiciones generales, orientado y cooperador.',
    physicalPalpation: 'Examen físico dentro de la normalidad para la patología base. Sin hallazgos agudos.',
    rectalExamination: 'N/A',
    anoscopy: 'N/A',
    diagnoses: [{
      diagnosis: 'Control de salud y evaluación médica',
      classification: 'General',
      complication: 'Ninguna',
      histologicType: '',
      stage: ''
    }],
    treatmentPlan: [{
      medication: 'Indicaciones Generales',
      presentation: 'Consejería médica',
      indication: 'Mantener tratamiento base y estilo de vida saludable.',
      duration: 'Continuo'
    }],
    evolutionaryReport: 'Evaluación integral satisfactoria. Se solicita control periódico según pauta de la especialidad.'
  },
];
