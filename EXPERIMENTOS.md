# Bitácora de Experimentos — Oráculo

Registro sistemático de exploraciones generativas, hipótesis teóricas y comportamientos morfológicos.

---

## Experimento 01: Quimera Simétrica (Bestiario de Rorschach)

**Fecha:** Noviembre 2026  
**Entorno:** p5.js, JavaScript modular (`oracle.js`, `automaton.js`, `sketch.js`)

### Hipótesis
Investigar si la imposición de una **simetría axial bilateral** sobre un autómata celular bidimensional (2D) es suficiente para transformar configuraciones matemáticas caóticas en morfologías reconocibles como organismos, cuerpos, quimeras o entidades apocalípticas. Asimismo, comprobar si una función hash determinista sobre el nombre permite una experiencia oracular reproducible sin perder la cualidad viva de la criatura.

### Implementación
1. **Traducción determinista (`oracle.js`):**
   - Hashing FNV-1a de 32 bits a partir del texto ingresado.
   - PRNG `mulberry32` alimentado por la semilla hash.
   - Derivación genética: selección y mutación de reglas *Life-like* (conjuntos de nacimiento $B$ y supervivencia $S$), generación de la matriz embrionaria central y asignación de paleta tonal.
2. **Autómata celular 2D (`automaton.js`):**
   - Grilla de $80 \times 80$ células con vecindad de Moore (8 vecinos) y bordes cerrados.
   - Espejado estricto de la mitad izquierda sobre la mitad derecha en cada ciclo de generación.
   - Sistema de memoria celular (`trail`): las células que mueren no desaparecen de inmediato, sino que dejan un residuo que decae progresivamente, sugiriendo tejido cicatrizal, cartílago o estela de tinta.
3. **Visualización e Interfaz (`sketch.js`, `index.html`, `style.css`):**
   - Lienzo de $640 \times 640$ píxeles (células de $8 \times 8$ px).
   - Controles de consulta, pausa, avance paso a paso y renacimiento del embrión.
   - Lectura visible de la firma hexadecimal, arquetipo de regla y contador de generaciones.

### Parámetros
- **Resolución:** $80 \times 80$ células.
- **Familias de reglas exploradas:**
  - *Ameba Apocalíptica:* B357/S1358
  - *Biomasa / Diamoeba:* B35678/S5678
  - *Laberinto Óseo:* B3/S12345
  - *Tejido Coralino:* B3/S45678
  - *Insectoide Pulsante:* B368/S245
  - *Pellejo / Mancha:* B34678/S3678
- **Embrión inicial:** Matriz centrada de tamaño variable (entre $6 \times 10$ y $18 \times 32$ células) reflejada axialmente.
- **Rastro de huella (decay):** $\Delta t = -0.015$ por generación.

### Resultado observado
- La simetría axial produce de inmediato una lectura corporal: el ojo humano interpreta las agrupaciones como vértebras, cuencas, tórax, extremidades o mandíbulas, evocando el efecto Rorschach y las descripciones quiméricas del Apocalipsis (langostas coronadas, bestias marinas y aladas).
- El sistema de rastro celular (`trail`) evita que el autómata se reduzca a una grilla binaria parpadeante; confiere volumen, carnalidad y memoria al movimiento.
- Al ingresar el mismo nombre en sucesivas ocasiones, la criatura renace exactamente con el mismo embrión y evolución, validando el principio oracular determinista.

### Lectura conceptual
- **Colli y el Enigma:** El nombre del consultante opera como cifra. El sistema no "crea" al azar, sino que *traduce* la palabra a una ley biológica oculta. El consultante no ve su foto ni una caricatura, sino el enigma que su nombre desata en la máquina.
- **Apocalipsis:** Se experimenta la tensión de la visión de Juan: seres que combinan atributos de animales e insectos en una estructura jerárquica y solemne.
- **Kristeva y la abyección:** El residuo que dejan las células al morir sugiere un cuerpo que se deshace y se regenera a sí mismo; materia que desborda el límite de la forma pura.

### Próximos pasos
- Explorar cómo reacciona la criatura a estímulos en tiempo real (proximidad del cursor como "toque" que altera levemente el tejido).
- Probar autómatas celulares con más de dos estados (por ejemplo, autómatas cíclicos o con estados refractarios).
- Experimentar con filtros de renderizado (desenfoque / umbral o shaders GL) para darle un aspecto aún más pictórico o carnoso.


---

## Experimento 02: Esqueleto Inmortal & Curaduría Genética (A-1 & B-2)

**Fecha:** Noviembre 2026  
**Entorno:** p5.js, Interfaz de Modulación Dinámica (`oracle.js`, `automaton.js`, `sketch.js`, `index.html`)

### Hipótesis
1. **Permanencia (A-1):** Declarar inmortales las células originarias del embrión resolverá el problema de la extinción total; el núcleo original actuará como un "hueso primordial" o ancla morfológica desde la cual la carne y extremidades pueden brotar y morir sin que la figura desaparezca.
2. **Contención espacial (B-2):** Sustituir la mutación abierta y desregulada por un catálogo curado de reglas *Life-like* no expansivas impedirá la proliferación metastásica incontrolada, manteniendo la silueta de la criatura contenida armónicamente dentro del lienzo.
3. **Control en tiempo real:** Disponer de una interfaz interactiva con manipulación de bits ($B/S$), persistencia del rastro y velocidad permitirá calibrar visualmente el punto exacto entre orden anatómico y turbulencia pulsional.

### Implementación
- **A-1 (Esqueleto Inmortal):** Se agregó una matriz booleana `isImmortal[y][x]` que fija las coordenadas del embrión derivado del nombre. En cada paso evolutivo, estas células se mantienen vivas y se renderizan con un tono áureo/óseo distintivo (`pal.immortal`), diferenciándose de la masa periférica viva.
- **B-2 (Catálogo Curado):** Se definieron 7 familias de reglas viables: *Vértebra & Calavera* [B3/S238], *Insectoide Pulsante* [B36/S245], *Ameba Contenida* [B35/S1358], *Cavidad & Membrana* [B37/S23], *Tejido Coralino* [B3/S4567], *Quimera Mitótica* [B34/S34] y *Sedas & Nervaduras* [B367/S23].
- **UI Interactiva:** Se construyó un panel lateral con:
  - Toggles para activar/desactivar el Esqueleto Inmortal y la Simetría Axial.
  - Selector de arquetipos curados y matriz de checkboxes en tiempo real para $B(1\dots8)$ y $S(1\dots8)$.
  - Sliders para FPS, tasa de decaimiento del rastro (fósil) y densidad embrionaria.
  - Selector de paletas cromáticas.

### Resultado observado
- Las figuras ya no se borran por completo: el núcleo primordial permanece encendido como una espina dorsal o glifo luminoso, y las estructuras secundarias oscilan rítmicamente en torno a él.
- El canvas ya no se desborda en masa amorfa de ruido: las reglas curadas preservan márgenes limpios y formas corpóreas reconocibles (alas, cuencas, costillas y antenas).
- Al apagar el toggle de simetría en vivo, es posible contrastar inmediatamente el orden anatómico formal con la deformación asimétrica pura.

### Lectura conceptual
- El esqueleto inmortal materializa la relación con **Giorgio Colli**: la palabra original no es un mero detonante efímero que se destruye, sino una *inscripción pétrea* que sostiene la visión.
- La distinción visual entre el hueso dorado inmortal y la carne pulsante traduce la dialéctica entre lo *simbólico* (fijo, estructurante) y lo *semiótico-abrupto* (móvil, viscoso, perecedero) de **Julia Kristeva**.


---

## Experimento 03: Membrana Biológica (B-1), Huella Indeleble & Sellado Oracular

**Fecha:** Noviembre 2026  
**Entorno:** p5.js, JavaScript modular, Interfaz de Modulación Dinámica

### Hipótesis
1. **Contención Infranqueable (B-1):** Implementar un campo de inhibición radial (membrana biológica circular) desde el centro del autómata garantizará de forma matemática que ninguna célula, rama ni planeador (*glider*) escape jamás del canvas, confinando la entidad en un espacio sagrado suspendido.
2. **Huella Indeleble:** Hacer que el rastro celular sea acumulativo (sedimentación) y no descienda de un piso mínimo fijará el paso histórico de la criatura como una mancha perenne en el lienzo (como tinta o fósil), evitando la pérdida de materia observada en versiones anteriores.
3. **Sellado de la Revelación (Límite temporal cifrado):** Ligar la cantidad de generaciones de evolución al nombre del consultante convertirá la experiencia en un rito oracular con principio, clímax y fijación definitiva, dejando un glifo o grabado estático final.

### Implementación
- **B-1 (Membrana Radial):** Cada célula calcula su distancia euclidiana al centro $D(x, y) = \sqrt{(x - x_c)^2 + (y - y_c)^2}$. Si $D > R_{\text{membrana}}$, el nacimiento y la supervivencia se anulan ($state = 0$). El radio se deriva deterministamente del nombre (entre 28 y 34 celdas) y se representa con un halo sutil en el fondo.
- **Rastro Indeleble (Sedimento):** Cuando una célula está viva, acumula sedimento ($\Delta t = +0.35$). Al morir, el valor no decae a cero sino que se detiene en un piso de memoria ($0.45$), de modo que el mapa de toda su trayectoria permanece grabado de forma perenne.
- **Sellado Oracular:** El oráculo calcula un límite de generaciones $N \in [80, 160]$ a partir del hash del nombre. Al alcanzar la generación límite, el bucle de actualización se interrumpe, la interfaz emite la insignia *"✦ SELLO CONSUMADO (ENIGMA FIJADO) ✦"* y se habilita la opción de descargar el glifo final en alta fidelidad (`.png`).

### Resultado observado
- Confinamiento absoluto: ninguna estructura toca ni deforma los bordes del lienzo; la criatura adopta una presencia orgánica suspendida en el vacío.
- El rastro acumulativo confiere una profundidad de grabado alquímico: la criatura adquiere volumen tridimensional aparente por la superposición de capas de tiempo.
- El sellado automático otorga un momento de cierre contemplativo potente: la entidad pasa de la convulsión del nacimiento a la quietud del jeroglífico sagrado.

### Lectura conceptual
- **Patmos y el Sello:** En el texto apocalíptico, los misterios son abiertos y luego sellados ("Sella las cosas que los siete truenos han dicho, y no las escribas"). El autómata ahora no es un flujo infinito indiferente, sino un evento que concluye en un enigma fijado.
- **La Huella en Kristeva y Colli:** La tinta no se borra. La escritura es fijación y cicatriz; el residuo material del cuerpo que intentó hablar.


---

## Experimento 04: Apoptosis Central & Necrosis por Asfixia (Opción 1-A)

**Fecha:** Noviembre 2026  
**Entorno:** p5.js, JavaScript modular (`automaton.js`, `sketch.js`, `index.html`)

### Hipótesis
Comprobar si introducir una regla biológica de **necrosis por sobrepoblación/asfixia celular (apoptosis central)** permite que las células del núcleo embrionario y de zonas hiperdensas se apaguen, superando la rigidez del esqueleto inmortal para excavar cavidades viscerales (ventrículos, cuencas, cajas torácicas) y generar claroscuro y sombras en el interior del cuerpo del monstruo.

### Implementación
1. **Mecánica de Asfixia Tisular y Excavación de Huecos (`automaton.js`):**
   - Cualquier célula viva que cuente con una cantidad de vecinos vivos mayor o igual al umbral crítico de asfixia ($N_{\text{vecinos}} \ge \theta_{\text{apoptosis}}$) sufre necrosis, se apaga ($state = 0$), pierde su condición inmortal (`isImmortal = 0`) y queda marcada como zona necrosada (`necrotized = 1`).
   - Las zonas necrosadas o interiores sin vecinos vivos erosionan su rastro (`trail`) hasta llegar a `0`, abriendo **huecos oscuros reales** en el centro del cuerpo en lugar de volver a encenderse o quedar manchadas con brillo permanente.
2. **Garantía Anti-Extinción y Congelado Definitivo (`oracle.js`, `automaton.js`):**
   - Se calibró la regla *Tejido Coralino* a `B36/S23` (que correspondía a consultas como `mauro` o `Patmos`), ya que la supervivencia anterior (`S4567`) colapsaba al combinarse con la muerte por sobrepoblación ($\ge 6$).
   - Se añadió un sistema de **protección anti-vacío**: si el esqueleto inmortal está desactivado y la población amenaza con extinguirse antes de `maxGenerations`, el autómata congela y sella preventivamente la última configuración viva; si está activo y la masa cae bajo el umbral mínimo, reactiva únicamente las costillas periféricas del embrión (`1..4` vecinos germinales) dejando el centro hueco.
3. **Jerarquía de Nitidez y Sombras al Congelar (`sketch.js`):**
   - En lugar de pintar todas las células vivas con nitidez total (100% de brillo + núcleo blanco), el renderizado distingue:
     - **Nodos de alta nitidez:** Costillas óseas y células maduras en equilibrio estructural ($2\text{–}3$ vecinos), que conservan su núcleo brillante.
     - **Tejido carnoso intermedio:** Células jóvenes o de transición en tonos medios sin núcleo saturado.
     - **Sombra visceral profunda:** Células densas ($\ge 5$ vecinos) previas a la asfixia, teñidas hacia la penumbra.
     - **Sedimento y Huecos:** Rastro graduado contiguo al tejido vivo y cavidades vacías ($trail = 0$) en los intersticios.
4. **Control Interactivo en Vivo (`sketch.js`, `index.html`):**
   - Toggle para activar/desactivar la **Apoptosis Central (1-A)** y slider de umbral de asfixia ($\theta \in [4, 8]$ vecinos).

### Parámetros
- **Umbral de asfixia estándar:** $\ge 6$ vecinos (modo moderado) o $\ge 5$ vecinos (modo cavernoso).
- **Interacción con Huella:** Las células que mueren por necrosis dejan su sombra en el sustrato fósil o revelan el abismo oscuro del fondo, quebrando la planitud de la silueta.

### Resultado observado
- El centro de la criatura deja de ser un parche macizo y saturado. Aparecen cuencas oscuras, fosas nasales/oculares, canales vertebrales y cámaras que se abren y cierran orgánicamente.
- Con umbral $\ge 5$, el tejido adquiere una estructura trabecular (como el tejido óseo esponjoso o corales perforados), con cavidades profundas donde la sombra del fondo penetra hasta el corazón de la entidad.
- Con umbral $\ge 6$, el esqueleto conserva mayor masa basal pero abre ventrículos centrales claros, manteniendo el balance entre solidez y vacío.

### Lectura conceptual
- **El cuerpo como cavidad y enigma:** Un cuerpo macizo es un bloque ciego; un cuerpo con cavidades e intersticios evoca órganos internos, criptas y secretos. La revelación no es solo lo que se expone a la luz, sino el abismo oscuro que alberga en su interior.
- **La tensión en Patmos y Kristeva:** La revelación devorada en el vientre (Apocalipsis 10) no es exterior ni lisa: es visceral, amarga y hueca. La necrosis introduce la finitud y la muerte dentro de la propia matemática del monstruo.

### Próximos pasos
- Abordar el segundo punto planteado: las variaciones de color (por ejemplo, envejecimiento celular por madurez o coloración por estrés de densidad) para que el volumen adquiera gradaciones cromáticas vivas.
