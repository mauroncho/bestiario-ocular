# AGENTS.md — Oráculo: exploración de un autómata celular

## 1. Contexto del proyecto

Este proyecto forma parte de una investigación artística para la materia Filosofía y Estética.

La intención es desarrollar una obra generativa que explore la relación entre cuerpo, lenguaje, código, revelación y enigma, tomando como punto de partida algunos textos trabajados durante el año.

La propuesta inicial consiste en desarrollar un sistema basado en autómatas celulares que, a partir de información proporcionada por un interactor, genere una entidad monstruosa o una configuración visual de carácter apocalíptico.

En esta primera etapa trabajaremos exclusivamente con **p5.js**, desarrollando prototipos y experimentos que permitan investigar las posibilidades visuales, matemáticas y conceptuales del autómata celular.

No existe todavía una definición cerrada sobre cómo debe ser el monstruo, qué tipo de autómata se utilizará ni cómo será la representación final. El desarrollo debe entenderse como un proceso de investigación y exploración.

## 2. Marco conceptual

La investigación parte de tres relaciones teóricas principales.

### Giorgio Colli: sabiduría, revelación y enigma

A partir de las reflexiones de Giorgio Colli en _El nacimiento de la filosofía_, interesa explorar la relación entre la experiencia mistérica, la manía, la adivinación y el enigma.

La sabiduría primordial está vinculada a una experiencia que excede la comunicación racional. Cuando esa experiencia intenta traducirse al lenguaje humano, se produce una transformación: aquello que era inmediato se convierte en enigma, ambigüedad y desafío interpretativo.

La escritura introduce otra transformación al fijar y conservar aquello que originalmente tenía una dimensión viva.

Interesa trasladar esta tensión al funcionamiento de un sistema algorítmico: una experiencia o información inicial es traducida a código y, mediante un conjunto de reglas, produce algo que no estaba contenido de manera evidente en su origen.

### El Apocalipsis: la revelación y los límites del lenguaje

El Apocalipsis de Juan de Patmos presenta una experiencia visionaria que intenta inscribirse en el lenguaje.

El texto está atravesado por imágenes monstruosas, transformaciones, criaturas y configuraciones que desbordan las estructuras habituales de representación.

Resulta especialmente interesante la tensión entre la experiencia de la revelación y la necesidad de escribirla.

También interesa el capítulo 10, donde Juan recibe un pequeño libro y debe comerlo. El libro es dulce en la boca y amargo en el vientre. La revelación es incorporada corporalmente antes de convertirse nuevamente en palabra.

Esta relación entre cuerpo, incorporación, transformación y lenguaje puede funcionar como una referencia para pensar el proceso generativo.

### Julia Kristeva: materialidad y extrañamiento del lenguaje

A partir de Kristeva interesa explorar cómo la materialidad del lenguaje puede alterar la organización habitual del sentido.

El lenguaje no es solamente un sistema transparente de comunicación. Su dimensión rítmica, material y pulsional puede desestabilizar las estructuras simbólicas y producir extrañamiento.

Esto puede trasladarse a una representación visual donde las formas intenten organizarse, pero produzcan deformaciones, excesos y configuraciones que no terminan de constituir una imagen reconocible.

## 3. Hipótesis conceptual de la obra

Una posible estructura conceptual es:

**CUERPO → TRADUCCIÓN → CÓDIGO → REVELACIÓN → ENIGMA**

El interactor proporciona información que funciona como origen de una consulta.

Esa información se transforma en parámetros algorítmicos: una semilla, una regla, condiciones iniciales o características de evolución.

El autómata celular procesa esa información y produce una configuración visual.

El resultado podría adquirir características anatómicas y manifestarse como una criatura monstruosa.

La criatura no debería ser necesariamente una representación literal del usuario ni una ilustración convencional de un monstruo apocalíptico.

Una hipótesis más interesante es que sea la forma que adquiere una revelación cuando intenta convertirse en lenguaje.

El sistema podría funcionar como un oráculo: cada consulta produce un resultado determinado, pero su significado permanece indescifrable.

**La relación entre la información inicial y el resultado debe existir, pero no necesariamente ser evidente para quien interactúa con la obra.**

## 4. El autómata celular como estructura generativa

El punto de partida técnico es el autómata celular elemental unidimensional de Stephen Wolfram.

Se utilizará como referencia el siguiente sketch de Daniel Shiffman (The Coding Train):

https://editor.p5js.org/codingtrain/sketches/IE77UYZ-G

Este ejemplo utiliza una matriz unidimensional de células binarias. Cada célula evoluciona en función de su estado y el de sus dos vecinas.

El sistema está determinado por:

- Una condición inicial.
- Una regla de evolución.
- Una cantidad de generaciones.
- Una estructura de vecindad.

El código actual es solamente un punto de partida. No significa que debamos conservar necesariamente el autómata unidimensional ni utilizar una regla específica.

Se pueden explorar diferentes posibilidades:

- Autómatas celulares elementales (1D).
- Autómatas celulares bidimensionales (2D).
- Diferentes reglas de evolución.
- Diferentes condiciones iniciales.
- Reglas con vecindades alternativas.
- Autómatas celulares continuos.
- Sistemas híbridos que combinen distintas dinámicas.

También interesa investigar sistemas como Lenia y otros modelos de vida artificial.

El objetivo es descubrir qué comportamientos y configuraciones visuales pueden resultar interesantes para la obra.

No debemos asumir que un autómata más complejo producirá necesariamente un resultado más interesante.

## 5. Input del interactor

Para los primeros prototipos se propone utilizar el nombre del interactor como input.

El nombre puede convertirse en una semilla determinista que configure el comportamiento del autómata.

Esto permitiría que una misma persona obtenga siempre el mismo resultado al ingresar exactamente el mismo nombre.

La implementación puede explorar diferentes estrategias:

- Convertir los caracteres del nombre en valores numéricos.
- Generar un hash del nombre.
- Utilizar el hash como semilla de un generador pseudoaleatorio.
- Derivar de esa semilla la regla del autómata.
- Utilizarla para configurar las condiciones iniciales.
- Modificar otros parámetros de evolución.

Es importante que el resultado sea reproducible: el mismo input debe producir exactamente la misma configuración.

Sin embargo, el nombre es solamente un primer recurso para prototipar.

A futuro interesa investigar la incorporación de información corporal o biométrica:

- Frecuencia cardíaca.
- Características de la voz.
- Datos obtenidos mediante una cámara.
- Puntos faciales mediante FaceMesh.
- Otros sensores o dispositivos de captura.

El agente puede proponer alternativas de input que resulten interesantes tanto técnica como conceptualmente.

No es necesario implementar sensores biométricos en esta etapa.

También interesa investigar qué significa conceptualmente utilizar información corporal como origen de una transformación algorítmica.

## 6. Entorno técnico

Durante esta etapa se utilizará:

- JavaScript.
- p5.js.
- HTML y CSS para la interfaz cuando sea necesario.

No incorporar Three.js en esta etapa, salvo que se discuta explícitamente una necesidad concreta.

La prioridad es desarrollar y comprender el sistema generativo antes de decidir su representación definitiva.

El código debe mantenerse organizado y modular.

Siempre que sea posible, separar:

- Generación de la semilla.
- Configuración del autómata.
- Condiciones iniciales.
- Reglas de evolución.
- Almacenamiento de generaciones.
- Interpretación de los resultados.
- Representación visual.

El autómata debería poder funcionar independientemente de cómo se visualice.

Esto permitirá experimentar con diferentes representaciones sin tener que modificar constantemente su funcionamiento interno.

## 7. Exploración visual y morfológica

Una de las principales preguntas de investigación es cómo pasar de una configuración matemática a una forma que pueda interpretarse como organismo, cuerpo o criatura.

No existe una solución definida.

Se pueden explorar diferentes estrategias:

**Patrones como escritura**

El resultado del autómata puede interpretarse como una estructura de signos, una escritura ilegible o una configuración gráfica.

**Patrones como anatomía**

Las agrupaciones de células pueden convertirse en masas corporales, ramificaciones, extremidades, cavidades, ojos o estructuras orgánicas.

**Patrones como crecimiento**

Las generaciones pueden interpretarse como etapas de desarrollo de una entidad.

**Patrones como volumen**

Las configuraciones bidimensionales pueden convertirse posteriormente en superficies o geometrías tridimensionales.

**Patrones como organismos**

Se pueden investigar sistemas en los que las estructuras generadas parezcan tener comportamientos autónomos, crecer, reproducirse, estabilizarse o desaparecer.

Estas posibilidades son líneas de exploración, no requisitos de implementación.

Es importante evitar que el resultado se convierta simplemente en una ilustración de un monstruo.

La relación entre el comportamiento matemático del sistema y la morfología resultante debe ser parte central de la investigación.

## 8. Metodología de trabajo con el agente

El agente debe funcionar como compañero de investigación y programación creativa.

No debe interpretar este documento como una especificación definitiva de la obra.

Se espera que pueda:

- Proponer experimentos técnicos y visuales.
- Sugerir diferentes tipos de autómatas celulares.
- Investigar alternativas de implementación en p5.js.
- Explicar el funcionamiento matemático de las reglas.
- Identificar comportamientos interesantes.
- Proponer posibles traducciones morfológicas.
- Relacionar los resultados con el marco conceptual.
- Señalar contradicciones o debilidades en las decisiones tomadas.
- Proponer caminos alternativos cuando una exploración no resulte interesante.

Es importante mantener una dinámica de trabajo exploratoria.

No desarrollar grandes sistemas sin antes validar pequeñas pruebas.

Cuando se proponga una modificación importante, explicar qué cambia, por qué podría ser interesante y qué posibilidades abre.

No asumir que todas las decisiones técnicas deben justificarse conceptualmente desde el principio. También es válido experimentar, observar resultados y encontrar posteriormente relaciones conceptuales.

**La investigación debe avanzar mediante iteraciones, no mediante la ejecución de un diseño cerrado.**

## 9. Registro de experimentos

Cuando se desarrolle una exploración significativa, documentarla brevemente.

Se propone utilizar esta estructura:

**Experimento:**

Nombre o número del experimento.

**Hipótesis:**

Qué comportamiento o resultado se quiere investigar.

**Implementación:**

Qué modificaciones se realizaron en el código.

**Parámetros:**

Reglas, condiciones iniciales, semillas y otros valores relevantes.

**Resultado:**

Qué comportamiento se observó.

**Lectura conceptual:**

Qué relaciones posibles aparecen con la investigación teórica.

**Próximos pasos:**

Qué posibilidades abre el experimento.

El registro debe permitir recuperar exploraciones anteriores y comparar resultados.

No es necesario documentar cada modificación menor del código.

## 10. Criterios conceptuales y preguntas abiertas

Hay algunas ideas que deberían permanecer presentes durante el desarrollo.

- ¿El monstruo representa al interactor o al proceso de traducción de su información?
- ¿El resultado es un retrato, una revelación o un enigma?
- ¿Qué relación existe entre la información inicial y la criatura resultante?
- ¿Qué significa que el mismo input produzca siempre el mismo resultado?
- ¿El determinismo del algoritmo contradice o refuerza el carácter oracular de la obra?
- ¿La criatura debería ser reconocible como organismo o mantenerse en un estado ambiguo?
- ¿El autómata funciona como una escritura que posteriormente adquiere cuerpo?
- ¿La imagen final revela algo o solamente produce la apariencia de una revelación?

Una cuestión central es evitar reducir el Apocalipsis a una representación visual de monstruos.

La investigación se vuelve más interesante si aborda el problema de la revelación y su traducción.

Del mismo modo, la relación con Colli no debería reducirse a afirmar que la escritura es una falsificación. Interesa explorar la transformación que ocurre cuando una experiencia que excede el lenguaje intenta conservarse y transmitirse mediante signos.

El monstruo no tiene que representar el Apocalipsis.

**Una hipótesis más interesante es que sea la forma que adquiere una revelación cuando intenta convertirse en lenguaje.**

## 11. Alcance de esta etapa

El objetivo inmediato es desarrollar un prototipo funcional en p5.js.

El prototipo debería permitir:

1. Ingresar un nombre.
2. Generar una semilla determinista a partir de ese nombre.
3. Configurar un autómata celular mediante esa semilla.
4. Ejecutar su evolución.
5. Visualizar el resultado.
6. Repetir la consulta y obtener exactamente el mismo resultado.

A partir de ahí, explorar diferentes reglas, condiciones iniciales y estrategias de representación.

No es necesario llegar todavía a una criatura tridimensional ni a una instalación interactiva completa.

La prioridad es descubrir qué posibilidades ofrece el autómata como sistema generativo y qué relación puede establecerse entre su funcionamiento y la investigación conceptual.

La obra definitiva, su estética, su interfaz, sus dispositivos de interacción y su materialización espacial permanecen abiertos.
