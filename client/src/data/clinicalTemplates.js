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
    specialty: 'Gastroenterología',
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
  }
];
