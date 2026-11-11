const $ = id => document.getElementById(id)
const esc = s =>
  String(s ?? '').replace(
    /[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  )
const SCHOOLS = JSON.parse($('d-schools').textContent)
const STATES = JSON.parse($('d-states').textContent)
const RES = JSON.parse($('d-res').textContent)
const byId = new Map(SCHOOLS.map(s => [s.id, s]))

const CATS = [
  ['F', 'Federal', '#4a6178'],
  ['C', 'Catholic', '#af5b5b'],
  ['P', 'Protestant', '#506c64'],
  ['M', 'Catholic and Protestant', '#8c6a3c'],
  ['U', 'Operator not recorded', '#a39a91']
]
const catColour = Object.fromEntries(CATS.map(c => [c[0], c[2]]))
const catName = Object.fromEntries(CATS.map(c => [c[0], c[1]]))
const catCount = Object.fromEntries(
  CATS.map(c => [c[0], SCHOOLS.filter(s => s.c === c[0]).length])
)

const openThrough = s => (s.o ? 1969 : s.e)
const dated = SCHOOLS.filter(
  s => s.s && openThrough(s) && openThrough(s) >= s.s
)
const SERIES = d3
  .range(1800, 1970)
  .map(y => ({
    y,
    n: dated.filter(s => s.s <= y && openThrough(s) >= y).length
  }))
const PEAK = SERIES.reduce((a, b) => (b.n > a.n ? b : a))

const src = {
  vol1: [
    'U.S. Department of the Interior, Federal Indian Boarding School Initiative Investigative Report, Vol. I (May 2022)',
    'https://www.bia.gov/sites/default/files/dup/inline-files/bsi_investigative_report_may_2022_508.pdf'
  ],
  vol2: [
    'U.S. Department of the Interior, Investigative Report, Vol. II (July 2024)',
    'https://www.bia.gov/sites/default/files/media_document/doi_federal_indian_boarding_school_initiative_investigative_report_vii_final_508_compliant.pdf'
  ],
  thornton: [
    'Arland Thornton and Linda Young-DeMarco, American Indian Schools and Student Enrollment: 1819 to 1940 (SSAI Working Paper 2023-01)',
    'https://ssai.isr.umich.edu/?p=1018'
  ],
  nabs: [
    'NABS, U.S. Indian Boarding School History',
    'https://boardingschoolhealing.org/us-indian-boarding-school-history/'
  ],
  nabsMap: [
    'NABS, interactive map and inventory of Indian boarding schools',
    'https://boardingschoolhealing.org/?p=15683'
  ],
  wapoData: [
    'The Washington Post, boarding school data on GitHub (CC BY-NC-SA 4.0)',
    'https://github.com/washingtonpost/data-boarding-schools'
  ],
  wapo: [
    'The Washington Post, deaths and burial sites at Indian boarding schools (December 2024)',
    'https://www.washingtonpost.com/investigations/interactive/2024/native-american-deaths-burial-sites-boarding-schools/'
  ],
  apology: [
    'Remarks by President Biden at the Gila River Indian Community, October 25, 2024 (govinfo)',
    'https://www.govinfo.gov/content/pkg/DCPD-202400946/html/DCPD-202400946.htm'
  ],
  s761: [
    'Senate Report 119-54 on S. 761, Truth and Healing Commission Act (July 31, 2025)',
    'https://www.govinfo.gov/content/pkg/CRPT-119srpt54/html/CRPT-119srpt54.htm'
  ],
  hr7325: [
    'H.R. 7325, Truth and Healing Commission Act of 2026 (introduced February 3, 2026)',
    'https://www.govinfo.gov/content/pkg/BILLS-119hr7325ih/html/BILLS-119hr7325ih.htm'
  ],
  nabs761: [
    'NABS, Support Senate Bill 761',
    'https://boardingschoolhealing.org/?p=19926'
  ],
  ap: [
    'Associated Press, Biden designates Carlisle Indian School as national monument (December 2024)',
    'https://katv.com/news/nation-world/biden-creates-native-american-boarding-school-national-monument-to-mark-era-of-forced-assimilation-president-carlisle-school-interior-secretary-deb-haaland-alaska-native-children'
  ]
}

const FEATURED = [
  {
    key: 'overview',
    name: 'Overview',
    card: 'All schools · 1819–1969',
    accent: '#8c5a3c',
    soft: '#dddddd',
    title: 'Indian Boarding Schools, 1819–1969',
    lede: 'From 1819 to 1969 the federal government operated or funded boarding schools to remove Native children from their families and assimilate them. Churches ran many of the schools with federal money.',
    kv: [
      ['Deaths documented', '3,104'],
      ['Schools (NABS)', '526'],
      ['Federal schools', '417'],
      ['Children identified', '18,624']
    ],
    record: [
      [
        'Deaths',
        'At least 3,104 children, 1828 to 1970.',
        'The Washington Post documented 3,104 deaths in December 2024 from government and school records, newspaper obituaries and oral histories. It found a cause for about half; infectious disease, most often tuberculosis, accounted for 1,156. More than 800 of the children were buried at or near their schools rather than returned home. The Interior Department’s Volume II counted 973 deaths at federal schools alone, which the Post’s count roughly triples. Historians expect the true toll to be higher still.'
      ],
      [
        'Schools',
        '526 in the NABS inventory; 417 in the Interior Department’s federal count.',
        'The Interior Department’s Volume I (May 2022) listed 408 federal schools and Volume II (July 2024) raised the count to 417 across 37 states or then-territories, noting more than 1,000 other institutions outside its criteria. NABS added 115 schools, most run by churches without federal support, and released a list of 526 in February 2025. This map shows the 521 inventory records with coordinates.'
      ],
      [
        'Burial Sites',
        '74 at 65 schools in the Interior Department’s count, plus 66 found by the Post.',
        'The Interior Department identified 74 marked and unmarked burial sites, up from 53 in Volume I, and withheld their locations to protect them from disturbance. The Post documented 66 more cemeteries at or near schools and school work sites.'
      ],
      [
        'Children Identified',
        '18,624 named, with tribal affiliation, in federal records.',
        'The Interior Department could identify this many children who entered the federal system between 1819 and 1969, and says far more attended. NABS puts boarding school enrollment at 60,889 by 1925 and at nearly 83 percent of Native school-age children by 1926.'
      ],
      [
        'Federal Spending',
        '$23.3 billion in inflation-adjusted dollars.',
        'Volume II estimated the federal appropriations for the schools and related assimilation programs. Religious and private operators received federal money as partners, and Volume I found that tribal trust funds may also have paid for children to attend.'
      ]
    ],
    timeline: [
      [
        1819,
        'The Civilization Fund Act appropriates money for missionary societies to teach Native children, opening the federal role.'
      ],
      [
        1869,
        'Grant’s Peace Policy assigns Indian agencies to Christian denominations, which run schools on reservations.'
      ],
      [
        1879,
        'Richard Henry Pratt opens the Carlisle Indian Industrial School in Pennsylvania, the first federal off-reservation boarding school.'
      ],
      [
        1891,
        'Congress authorizes the Commissioner of Indian Affairs to make and enforce rules compelling attendance.'
      ],
      [
        1893,
        'Congress authorizes withholding rations and annuities from families who refuse to send their children.'
      ],
      [
        1928,
        'The Meriam Report, commissioned by the Interior Department, condemns malnutrition, overcrowding and child labor in the schools.'
      ],
      [
        1969,
        'A Senate subcommittee report, Indian Education: A National Tragedy, condemns the schools for attacking Native cultures.'
      ],
      [
        1978,
        'The Indian Child Welfare Act and the American Indian Religious Freedom Act become law.'
      ],
      [
        2021,
        'Secretary Deb Haaland launches the Federal Indian Boarding School Initiative in June.'
      ],
      [
        2022,
        'The Interior Department releases Volume I: 408 schools and burial sites at 53 of them.'
      ],
      [
        2024,
        'Volume II (July): 417 federal schools and 74 burial sites. President Biden apologizes on October 25 at the Gila River Indian Community. Carlisle becomes a national monument on December 9. The Washington Post documents 3,104 deaths.'
      ],
      [
        2025,
        'S. 761, to create a Truth and Healing Commission, is reintroduced in February, clears the Senate Committee on Indian Affairs unanimously in March and is reported in July. It awaits a floor vote.'
      ],
      [
        2026,
        'Representative Tom Cole introduces the House companion, H.R. 7325, on February 3.'
      ]
    ],
    sources: [
      'wapo',
      'wapoData',
      'vol2',
      'vol1',
      'nabs',
      'nabsMap',
      'apology',
      'ap',
      's761',
      'nabs761',
      'hr7325'
    ],
    know: 'The Post’s count of 3,104 deaths is the most complete public accounting to date, and it is still a minimum.',
    chips: [
      'Federal',
      'Catholic',
      'Protestant',
      'Mission',
      'Contract',
      'Day schools'
    ]
  },

  {
    key: 'carlisle',
    id: 481,
    name: 'Carlisle',
    card: 'Pennsylvania · 1879–1918',
    title: 'Carlisle Indian Industrial School',
    lede: 'The first federal off-reservation boarding school, opened in an Army barracks by Captain Richard Henry Pratt and copied across the country.',
    kv: [
      ['Years', '1879–1918'],
      ['Operator', 'Federal (Interior Department)'],
      ['Students', 'About 7,800'],
      ['Deaths documented', '232']
    ],
    record: [
      [
        'Founding',
        'The Army handed Carlisle Barracks to the Indian Office.',
        'Pratt, an Army officer, opened the school in 1879 on a military post that was not in regular use. Children arrived by train from reservations across the West, many taken against their parents’ will.',
        1
      ],
      [
        'Pratt’s Method',
        'Copied by hundreds of schools.',
        'Pratt summarized his aim in an 1892 speech: “kill the Indian in him, and save the man.” Haircuts, uniforms, new names, military drill and a ban on Native languages spread from Carlisle to hundreds of schools.'
      ],
      [
        'Outing System',
        'Students placed with white families as laborers.',
        'Carlisle sent students to live and work on farms and in households, presented as training in “civilized” life. The practice was copied by other off-reservation schools.'
      ],
      [
        'Cemetery',
        'At least 180 children buried on the post.',
        'The Washington Post documented 232 deaths at Carlisle. Children died of tuberculosis and other diseases. Those not sent home were buried in a cemetery the Army later moved to make room for development.',
        1
      ],
      [
        'Repatriation',
        'Army disinterments since 2017.',
        'The Office of Army Cemeteries has disinterred children for return to their nations every year since 2017. The eighth season, in 2025, returned 17 children, including 16 to the Cheyenne and Arapaho Tribes.'
      ],
      [
        'National Monument',
        'Designated December 9, 2024.',
        'The 25-acre site, on the grounds of the U.S. Army War College, is managed by the National Park Service and the Army.'
      ]
    ],
    timeline: [
      [1879, 'School opens at Carlisle Barracks.'],
      [1892, 'Pratt gives the “kill the Indian” speech.'],
      [1918, 'School closes; the post returns to the Army.'],
      [1961, 'Named a National Historic Landmark.'],
      [2017, 'Army begins disinterring children for return.'],
      [
        2024,
        'Carlisle Federal Indian Boarding School National Monument designated.'
      ],
      [2025, 'Eighth disinterment season returns 17 children.']
    ],
    sources: [
      ['Associated Press on the national monument (December 2024)', src.ap[1]],
      [
        'Native News Online, eighth year of Army disinterment (2025)',
        'https://nativenewsonline.net/currents/army-conducts-eighth-year-of-disinterment-and-return-of-native-american-children-at-carlisle-barracks'
      ],
      [
        'Buffalo’s Fire, Army releases findings from the 2025 program',
        'https://www.buffalosfire.com/the-daily-spark/army-releases-findings-from-carlisle-barracks-disinterment-program'
      ],
      'vol2'
    ],
    know: 'Biden, designating the monument, put Carlisle’s enrollment at about 7,800 children from more than 140 tribes.',
    chips: [
      'Cheyenne',
      'Arapaho',
      'Seminole',
      'Sicangu Lakota',
      'Fort Belknap',
      'Laguna Pueblo'
    ]
  },

  {
    key: 'chemawa',
    id: 492,
    name: 'Chemawa',
    card: 'Oregon · 1880–present',
    title: 'Chemawa Indian School',
    lede: 'Opened at Forest Grove in 1880 with eighteen Puyallup children, moved to Salem in 1885, and still operating: the oldest federal boarding school in continuous use.',
    kv: [
      ['Opened', 'February 25, 1880'],
      ['Operator', 'Federal (BIE)'],
      ['Deaths documented', '268'],
      ['Buried on site', 'About 175']
    ],
    record: [
      [
        'Forest Grove, 1880–1885',
        'Opened with fourteen boys and four girls from Puyallup.',
        'The school opened in Forest Grove. The first student to die, Martha Lot (Spokane), died in October 1881; ten more died at Forest Grove before the move, mostly of tuberculosis.'
      ],
      [
        'Relocation to Salem',
        'Students cleared the new site.',
        'The first group arrived at Chemawa in March 1885 to clear land. The Forest Grove campus was abandoned by April 1886.',
        1
      ],
      [
        'Deaths and Burials',
        '268 documented by the Post.',
        'The Washington Post documented 268; Pacific University researchers count at least 270. About 175 are buried in the school cemetery and about 40 were sent home. Roughly 50 are unaccounted for, and researchers think 10 to 40 unmarked graves may lie in the cemetery.',
        1
      ],
      [
        'Research',
        'Database of names and burial places, 2021.',
        'Pacific University archivist Eva Guggemos and historian SuAnn Reddick published the record in October 2021, compiled from school and cemetery records.'
      ]
    ],
    timeline: [
      [1880, 'Forest Grove Indian Training School opens.'],
      [1881, 'First recorded student death, Martha Lot.'],
      [1885, 'Relocation to Chemawa, near Salem, begins.'],
      [1932, 'Last confirmed student burial in the school cemetery.'],
      [2021, 'Deaths at Chemawa database published.']
    ],
    sources: [
      [
        'Pacific University, Deaths at Chemawa Indian School',
        'https://heritage.lib.pacificu.edu/s/deaths-chemawa'
      ],
      [
        'Pacific University, Chemawa timeline',
        'https://heritage.lib.pacificu.edu/s/deaths-chemawa/page/timeline'
      ],
      [
        'OPB, Chemawa Indian School opened 145 years ago (2025)',
        'https://opb.org/article/2025/02/25/chemawa-indian-school-opened-145-years-ago'
      ]
    ],
    know: 'Chemawa students came from across the Pacific Northwest; about 270 died in the school’s custody by 1945.',
    chips: ['Puyallup', 'Spokane', 'Tulalip']
  },

  {
    key: 'haskell',
    id: 164,
    name: 'Haskell',
    card: 'Kansas · 1884–present',
    title: 'Haskell Institute',
    lede: 'Opened as the United States Indian Industrial Training School with 22 children; now Haskell Indian Nations University, still run by the federal government.',
    kv: [
      ['Opened', 'September 17, 1884'],
      ['Operator', 'Federal (BIE)'],
      ['Deaths documented', '146'],
      ['Marked graves', '103']
    ],
    record: [
      [
        'Founding',
        '22 children from six nations.',
        'The first 22 students were Ponca, Sac and Fox, Shawnee, Kiowa, Comanche and Chippewa Munsee. Boys trained in trades such as tailoring and blacksmithing; students were physically punished for breaking rules.'
      ],
      [
        'Cemetery',
        '103 children buried, 1885 to 1943.',
        'The Washington Post documented 146 deaths at Haskell, more than the 103 marked graves. Each stone gives a name, a nation and an age. Eight more people are believed buried there in unmarked graves, and community accounts hold that more lie in the wetlands south of campus.',
        1
      ],
      [
        'Later History',
        'High school, junior college, university.',
        'Haskell became a high school in 1927, graduated its last high school class in 1965, became a junior college around 1970 and a university in 1993.'
      ]
    ],
    timeline: [
      [1884, 'Opens in Lawrence, Kansas.'],
      [1885, 'First burial in the school cemetery.'],
      [1943, 'Last burial in the cemetery.'],
      [1965, 'Last high school class graduates.'],
      [1993, 'Becomes Haskell Indian Nations University.'],
      [2018, 'Cemetery fenced after vandalism.']
    ],
    sources: [
      [
        'SABR, “Onward, Haskell”',
        'https://sabr.org/journal/article/onward-haskell/'
      ],
      [
        'Haskell History, cemetery records',
        'https://www.haskellhistory.com/cemetery'
      ],
      [
        'Lawrence Times, Haskell headstone project (2023)',
        'https://lawrencekstimes.com/2023/12/30/haskell-headstone-project-to-begin/'
      ]
    ],
    know: 'Haskell is the only federally operated university for Native students.',
    chips: ['Ponca', 'Sac and Fox', 'Shawnee', 'Kiowa', 'Comanche']
  },

  {
    key: 'genoa',
    id: 143,
    name: 'Genoa',
    card: 'Nebraska · 1884–1934',
    title: 'Genoa Indian Industrial School',
    lede: 'Built in a schoolhouse the United States had promised the Pawnee, then turned into one of the largest federal schools after the Pawnee were forced to Indian Territory.',
    kv: [
      ['Years', '1884–1934'],
      ['Operator', 'Federal'],
      ['Peak enrollment', 'Nearly 600'],
      ['Deaths documented', '54']
    ],
    record: [
      [
        'Founding',
        'Built on the Pawnee Reservation.',
        'The United States built the first schoolhouse on the Pawnee Reservation under treaty. After the Pawnee were pushed to Indian Territory in the 1870s, it became the Genoa school, eventually a 640-acre campus of more than thirty buildings.',
        1
      ],
      [
        'Students and Labor',
        'Children from more than 40 nations.',
        'Brought by train from as far as Idaho and Maine, students aged 4 to 22 spent much of the day in manual training, such as bridle-making for boys and sewing for girls, with a basic academic education.'
      ],
      [
        'Deaths',
        '54 documented by the Post; at least 86 by local researchers.',
        'The Washington Post documented 54 deaths. The Genoa Indian School Digital Reconciliation Project, working from newspaper clippings, superintendent’s records and other documents, has confirmed at least 86, most from tuberculosis, typhoid and measles, and has named 49 of them.'
      ],
      [
        'Cemetery',
        'Location unknown.',
        'Archaeologists, trained dogs and ground-penetrating radar searched candidate sites in 2021 and 2022. Most buildings were demolished and the land sold after the school closed.',
        1
      ]
    ],
    timeline: [
      [1884, 'Genoa school opens.'],
      [1934, 'School closes.'],
      [2017, 'Digital Reconciliation Project launches.'],
      [
        2021,
        'Researchers release a list of up to 102 possible deaths and begin radar searches.'
      ],
      [2022, 'Search narrows to candidate cemetery sites; 86 deaths confirmed.']
    ],
    sources: [
      [
        'Associated Press, researchers seek lost Genoa graves (2022)',
        'https://www.ksat.com/news/politics/2022/11/24/researchers-seek-lost-native-american-boarding-school-graves/'
      ],
      [
        'ABA Journal, America’s stolen children',
        'https://abajournal.com/magazine/article/americans-stolen-children'
      ]
    ],
    know: 'The school building that survives is now the Genoa U.S. Indian School Museum.',
    chips: ['Ponca', 'More than 40 nations']
  },

  {
    key: 'chilocco',
    id: 507,
    name: 'Chilocco',
    card: 'Oklahoma · 1884–1980',
    title: 'Chilocco Indian Agricultural School',
    lede: 'An agricultural school on Indian Territory land set aside by executive order and run on Pratt’s military template for half a century.',
    kv: [
      ['Years', '1884–1980'],
      ['Operator', 'Federal'],
      ['Students', 'Nearly 18,000'],
      ['Deaths documented', '50']
    ],
    record: [
      [
        'Founding',
        'Executive order of July 12, 1884.',
        'President Chester Arthur set aside the land. The first students came from the Kiowa, Comanche, Wichita, Cheyenne and Arapaho agencies.'
      ],
      [
        'Discipline and Labor',
        'Military discipline, trades and field labor.',
        'From 1884 into the early 1930s Chilocco followed Pratt’s model. Children were often rounded up by wagon and sent against their will; students broke boulders on the rockpile for construction stone.'
      ],
      [
        'Closure',
        'June 3, 1980.',
        'After protests, including a 1972 sit-in by the National Indian Youth Council, the school closed on June 3, 1980. The final superintendent called it another broken promise.'
      ],
      [
        'Cemetery',
        'Abandoned by the Bureau of Indian Affairs.',
        'When the school closed, the BIA left the cemetery south of campus. Alumni have maintained it since and raised a monument naming the students who died, with their ages and nations.',
        1
      ]
    ],
    timeline: [
      [1884, 'School opens.'],
      [1894, 'First graduating class of 15.'],
      [1972, 'National Indian Youth Council sit-in.'],
      [1980, 'School closes on June 3.'],
      [2006, 'Listed on the National Register of Historic Places.']
    ],
    sources: [
      [
        'KOSU, Chilocco should remain a site of conscience (2021)',
        'https://www.kosu.org/history/2021-12-21/chilocco-indian-agricultural-school-should-remain-site-of-conscience'
      ],
      [
        'Investigation into the Chilocco Indian Agricultural School (DttP)',
        'https://journals.ala.org/index.php/dttp/article/view/8341/11599'
      ],
      [
        'Oklahoma Historical Society, Chilocco student index',
        'https://www.okhistory.org/research/chiloccorecord'
      ]
    ],
    know: 'Chilocco granted high school diplomas to 5,542 students.',
    chips: ['Cherokee', 'Choctaw', 'Navajo', 'Creek', 'Kiowa'],
    note: 'The inventory record gives an 1871 opening date; this page uses the 1884 executive order and opening.'
  },

  {
    key: 'rapidcity',
    id: 342,
    name: 'Rapid City',
    card: 'South Dakota · 1898–1933',
    title: 'Rapid City Indian School',
    lede: 'A federal off-reservation school in Rapid City. At least 50 children died there, and many were buried in unmarked graves on the hill above the campus.',
    kv: [
      ['Years', '1898–1933'],
      ['Operator', 'Federal'],
      ['Enrollment', '340 by the 1920s'],
      ['Deaths documented', '45']
    ],
    record: [
      [
        'Daily Schedule',
        'Classes for part of the day, labor for the rest.',
        'Rapid City ran on half days: classes for part of the day and labor for the rest, under harsh discipline.'
      ],
      [
        'Deaths and Burials',
        '45 documented by the Post; at least 50 by local researchers.',
        'The Washington Post documented 45 deaths; the Remembering the Children project counts at least 50. Causes recorded include disease and the effects of malnutrition. Some children died traveling to or from the school, and some froze to death trying to escape. Many were buried in unmarked graves on the hill behind what is now West Middle School.',
        1
      ],
      [
        'Later Use of the Site',
        'Sanatorium, then hospital.',
        'The Sioux Sanatorium for Native tuberculosis patients opened on the site in 1939. The grounds are now home to the Sioux San hospital.'
      ],
      [
        'Memorial',
        'Opened September 2024.',
        'Research begun around 2017 grew into the Remembering the Children memorial on the school grounds, which opened in September 2024 with a plaza of name signs below the burial hill.'
      ]
    ],
    timeline: [
      [1898, 'School opens.'],
      [1933, 'School closes.'],
      [1939, 'Sioux Sanatorium opens on the site.'],
      [2017, 'Rapid City Indian Boarding School Lands Project begins.'],
      [2024, 'Remembering the Children memorial opens.']
    ],
    sources: [
      [
        'SDPB, Rapid City walks to memorial site (2024)',
        'https://sdpb.org/2024-09-30/rapid-city-community-walks-to-memorial-site-for-children-who-died-at-boarding-school'
      ],
      [
        'Northern Plains News, new memorial in Rapid City',
        'https://www.kdsj980.com/?p=16904'
      ],
      [
        'Dakotas UMC, Remember the Children',
        'https://dakotasumc.org/news/canyon-lake-umc-honored-to-remember-the-children'
      ]
    ],
    know: 'Jennie Pretends Eagle, from Standing Rock, died at the school in December 1918, aged 18. Her cause of death was not recorded.',
    chips: ['Standing Rock'],
    note: 'The inventory record lists this school as still open; the Interior Department’s own narrative gives 1898 to 1933, used here and on the map.'
  },

  {
    key: 'holyrosary',
    id: 343,
    name: 'Holy Rosary',
    card: 'Pine Ridge · 1888–1980',
    title: 'Holy Rosary Mission',
    lede: 'A Jesuit and Franciscan mission school on Oglala Lakota land, founded after Red Cloud invited the Jesuits, that boarded children for nearly a century.',
    kv: [
      ['Founded', '1888'],
      ['Operator', 'Catholic, federally supported'],
      ['Boarding ended', '1980'],
      ['Deaths documented', '5']
    ],
    record: [
      [
        'Founding',
        'Red Cloud invited the Jesuits.',
        'Red Cloud hoped Catholic schooling would equip Lakota children to survive. More than 100 students attended by 1889.',
        1
      ],
      [
        'Language Suppression',
        'Lakota was forbidden to students.',
        'Jesuits and Franciscan sisters studied Lakota while enforcing the federal ban on Native languages. Hair was cut, names were changed and traditional dress was banned.'
      ],
      [
        'Runaways',
        'Returned by agency police.',
        'Federal policy required schools to report truancy, and the mission enlisted reservation police to bring escaped children back.'
      ],
      [
        'Truth and Healing Initiative',
        'Launched in 2019.',
        'Red Cloud Indian School launched a Truth and Healing initiative in 2019, gathering survivor testimony, opening archives and searching grounds for unmarked graves. Some Oglala community members object to the school and the Church leading their own investigation.'
      ]
    ],
    timeline: [
      [1888, 'Holy Rosary Mission founded.'],
      [1889, 'More than 100 students enrolled.'],
      [1969, 'Renamed Red Cloud Indian School.'],
      [1980, 'Boarding ends; becomes a day school.'],
      [2019, 'Truth and Healing initiative launched.']
    ],
    sources: [
      [
        'Jesuits Midwest, truth-telling initiative at Red Cloud',
        'https://www.jesuitsmidwest.org/stories/new-truth-telling-initiative-confronts-red-cloud-indian-schools-past/'
      ],
      [
        'America, Indigenous Peoples Day and Holy Rosary (2021)',
        'https://www.americamagazine.org/politics-society/2021/10/08/indigenous-peoples-day-orange-shirt-culture-jesuits-boarding-school'
      ],
      [
        'ICT, Red Cloud Indian School will dig for graves',
        'https://ictnews.org/news/red-cloud-indian-school-will-dig-for-graves/'
      ]
    ],
    know: 'Survivors’ accounts differ: some recall abuse and loss, others gratitude. The initiative records both.',
    chips: ['Oglala Lakota']
  },

  {
    key: 'stfrancis',
    id: 422,
    name: 'St. Francis',
    card: 'Rosebud · 1886–1975',
    title: 'St. Francis Mission School',
    lede: 'Founded on the Rosebud Reservation after Spotted Tail’s repeated requests for Catholic teachers, and staffed by Jesuits and Franciscan sisters for nearly ninety years.',
    kv: [
      ['School opened', 'June 15, 1886'],
      ['Operator', 'Catholic, contract'],
      ['Enrollment', '500+ by the 1940s'],
      ['Deaths documented', '1']
    ],
    record: [
      [
        'Founding',
        'First building funded by Katharine Drexel.',
        'Jesuits took possession of the mission on January 1, 1886; the school opened that June. The Philadelphia heiress Katharine Drexel paid for the first building and kept funding the mission.',
        1
      ],
      [
        'Federal Funding',
        'Contract payments from 1884; boarding subsidies from 1935.',
        'The federal government paid varying amounts toward the school from 1884 to 1901, and from 1935 subsidized the boarding of students.'
      ],
      [
        'Enrollment',
        'More than 500 by the 1940s.',
        'Enrollment passed 200 in 1891 and 300 in 1909. By the 1940s and 1950s it exceeded 500. Dormitories were phased out between 1964 and 1975.'
      ],
      [
        'Transfer to Local Control',
        '1972.',
        'Control passed to a local corporation in 1972, and the buildings went to a parents’ corporation in 1979. The school is now St. Francis Indian School.'
      ]
    ],
    timeline: [
      [1886, 'Mission and school established.'],
      [1891, 'Enrollment exceeds 200.'],
      [1909, 'Enrollment exceeds 300.'],
      [1935, 'Federal boarding subsidies begin.'],
      [1964, 'Dormitories begin to be phased out.'],
      [1972, 'Control transferred to a local corporation.']
    ],
    sources: [
      [
        'Marquette University Archives, St. Francis Mission history',
        'https://www.marquette.edu/library/archives/Mss/SFM/SFM-history.php'
      ],
      [
        'National Register nomination, St. Francis Mission (1975)',
        'https://npgallery.nps.gov/NRHP/GetAsset/NRHP/75001723_text'
      ]
    ],
    know: 'Catholic Sioux Congresses, gatherings of Lakota Catholics, met at the mission from 1893.',
    chips: ['Sicangu (Brulé) Lakota']
  }
]
FEATURED.forEach(f => {
  if (f.id) {
    const s = byId.get(f.id)
    f.s = s
    f.cat = s.c
    f.accent = catColour[s.c]
    f.soft = f.cat === 'C' ? '#f5e3e1' : '#e4e9ef'
  }
})
const featByKey = Object.fromEntries(FEATURED.map(f => [f.key, f]))
const featById = new Map(FEATURED.filter(f => f.id).map(f => [f.id, f]))

/* ---------- map ---------- */
const mapEl = $('map'),
  stageEl = document.querySelector('.stage')
const states = topojson.feature(STATES, STATES.objects.states)
const nation = topojson.mesh(STATES, STATES.objects.nation)
const resKey = Object.keys(RES.objects)[0]
const res = topojson.feature(RES, RES.objects[resKey])
res.features.forEach(f => {
  if (d3.geoArea(f) > 2 * Math.PI) {
    const g = f.geometry
    ;(g.type === 'Polygon' ? [g.coordinates] : g.coordinates).forEach(poly =>
      poly.forEach(r => r.reverse())
    )
  }
})
const projection = d3.geoAlbersUsa()
const path = d3.geoPath(projection)
SCHOOLS.forEach(s => {
  s.p = projection([s.x, s.y])
})
const svg = d3
  .select(mapEl)
  .append('svg')
  .attr('role', 'img')
  .attr('aria-label', 'Map of 521 Indian boarding schools in the United States')
const g = svg.append('g')
const gStates = g.append('g'),
  gRes = g.append('g'),
  gNation = g.append('g'),
  gPts = g.append('g')
let W = 0,
  H = 0,
  K = 1,
  T = d3.zoomIdentity
const zoom = d3
  .zoom()
  .scaleExtent([1, 14])
  .filter(
    e =>
      (e.type === 'mousedown' && !e.button) ||
      (e.type === 'touchstart' && e.touches.length > 1) ||
      e.type === 'dblclick'
  )
  .on('zoom', e => {
    T = e.transform
    K = T.k
    g.attr('transform', T)
    gPts.selectAll('circle').attr('r', radius)
    syncSlider()
    placeCalls()
    hideTip()
  })
svg.call(zoom).on('dblclick.zoom', null)
mapEl.style.touchAction = 'pan-y'
svg.style('touch-action', 'pan-y')
let sizeByDeaths = true
const baseRadius = s =>
  sizeByDeaths && s.d ? 2.8 + 0.75 * Math.sqrt(s.d) : 3.2
const radius = s => (baseRadius(s) + (s === sel ? 1.6 : 0)) / Math.sqrt(K)

function draw () {
  W = mapEl.clientWidth
  stageEl.style.paddingTop = $('legend').offsetHeight + 12 + 'px'
  projection.fitWidth(W - 16, states)
  const b = path.bounds(states)
  projection.translate([
    projection.translate()[0] + 8 - b[0][0],
    projection.translate()[1] + 6 - b[0][1]
  ])
  H = Math.ceil(b[1][1] - b[0][1]) + 12
  mapEl.style.height = H + 'px'
  svg.attr('viewBox', `0 0 ${W} ${H}`)

  SCHOOLS.forEach(s => {
    s.p = projection([s.x, s.y])
  })
  gStates
    .selectAll('path')
    .data(states.features)
    .join('path')
    .attr('class', 'state')
    .attr('d', path)
  gRes
    .selectAll('path')
    .data(res.features)
    .join('path')
    .attr('class', 'res')
    .attr('d', path)
  gNation
    .selectAll('path')
    .data([nation])
    .join('path')
    .attr('class', 'nation')
    .attr('d', path)
  const pts = SCHOOLS.filter(s => s.p).sort((a, b) => (b.d || 0) - (a.d || 0))
  gPts
    .selectAll('circle')
    .data(pts, d => d.id)
    .join('circle')
    .attr('class', d => 'pt' + (featById.has(d.id) ? ' feat' : ''))
    .attr('cx', d => d.p[0])
    .attr('cy', d => d.p[1])
    .attr('r', radius)
    .attr('fill', d => catColour[d.c])
    .on('pointerenter', (e, d) => showTip(e, d))
    .on('pointermove', (e, d) => showTip(e, d))
    .on('pointerleave', hideTip)
    .on('click', (e, d) => {
      e.stopPropagation()
      featById.has(d.id) ? select(featById.get(d.id).key) : selectSchool(d)
    })
  applyFilter()
  zoom
    .extent([
      [0, 0],
      [W, H]
    ])
    .translateExtent([
      [-W * 0.2, -H * 0.2],
      [W * 1.2, H * 1.2]
    ])
  thumbs()
  drawTimeline()
}

/* ---------- filters and year mode ---------- */
const shownCats = new Set(CATS.map(c => c[0]))
let yearMode = false,
  year = PEAK.y,
  playing = null
$('legend').innerHTML =
  CATS.map(
    ([k, n, c]) =>
      `<button data-c="${k}" aria-pressed="true"><i style="background:${c}"></i>${n}<span>${catCount[k]}</span></button>`
  ).join('') +
  '<button class="resk" data-res aria-pressed="true"><i></i>Reservations</button><button class="sizek" data-size aria-pressed="true"><svg width="30" height="16" aria-hidden="true"><circle cx="5" cy="11" r="3" fill="none" stroke="#5a5a5a" stroke-width=".8"/><circle cx="19" cy="8.5" r="7" fill="none" stroke="#5a5a5a" stroke-width=".8"/></svg>Sized by deaths</button><div class="yearbox" id="yearbox" hidden aria-live="polite"><b id="yrBig"></b><span id="yrN"></span></div>'
$('legend')
  .querySelectorAll('[data-c]')
  .forEach(
    b =>
      (b.onclick = () => {
        const k = b.dataset.c
        shownCats.has(k) ? shownCats.delete(k) : shownCats.add(k)
        b.setAttribute('aria-pressed', shownCats.has(k))
        applyFilter()
      })
  )
$('legend').querySelector('[data-size]').onclick = e => {
  sizeByDeaths = !sizeByDeaths
  e.currentTarget.setAttribute('aria-pressed', sizeByDeaths)
  applyFilter()
}
$('legend').querySelector('[data-res]').onclick = e => {
  const b = e.currentTarget,
    on = b.getAttribute('aria-pressed') !== 'true'
  b.setAttribute('aria-pressed', on)
  mapEl.classList.toggle('res-off', !on)
}
const isOpen = (s, y) =>
  s.s && s.s <= y && openThrough(s) && openThrough(s) >= y
function applyFilter () {
  gPts
    .selectAll('circle')
    .classed('dim', d => !shownCats.has(d.c) || (yearMode && !isOpen(d, year)))
    .classed('sel', d => d === sel)
    .attr('r', radius)
  if (yearMode) {
    const n = SCHOOLS.filter(s => shownCats.has(s.c) && isOpen(s, year)).length
    $('yrBig').textContent = year
    $('yrN').textContent = `${n} school${n === 1 ? '' : 's'} open`
  }
  placeCalls()
}
function setYearMode (on) {
  yearMode = on
  $('mAll').setAttribute('aria-pressed', !on)
  $('mYear').setAttribute('aria-pressed', on)
  $('yearbox').hidden = !on
  drawNow()
  if (!on) stopPlay()
  applyFilter()
  const pt = $('legend').offsetHeight + 12 + 'px'
  if (stageEl.style.paddingTop !== pt) {
    stageEl.style.paddingTop = pt
    placeCalls()
  }
}
function setYear (y) {
  year = Math.max(1819, Math.min(1969, Math.round(y)))
  applyFilter()
  drawNow()
}
$('mAll').onclick = () => setYearMode(false)
$('mYear').onclick = () => setYearMode(true)
const playIcon =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>',
  pauseIcon =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'
function stopPlay () {
  if (playing) {
    clearInterval(playing)
    playing = null
    $('play').innerHTML = playIcon
    $('play').setAttribute('aria-label', 'Play years')
  }
}
$('play').onclick = () => {
  if (playing) return stopPlay()
  if (!yearMode) setYearMode(true)
  if (year >= 1969) setYear(1819)
  $('play').innerHTML = pauseIcon
  $('play').setAttribute('aria-label', 'Pause')
  playing = setInterval(
    () => {
      if (year >= 1969) return stopPlay()
      setYear(year + 1)
    },
    matchMedia('(prefers-reduced-motion: reduce)').matches ? 400 : 110
  )
}

/* ---------- timeline strip under the map ---------- */
const EVENTS = [
  [1819, 'Civilization Fund Act'],
  [1869, 'Peace Policy'],
  [1879, 'Carlisle opens'],
  [1891, 'Compulsory attendance'],
  [PEAK.y, `${PEAK.n} schools open`],
  [1928, 'Meriam Report'],
  [1969, 'Senate report']
]
const tl = d3.select('#tlsvg')
let tlx = null
function drawTimeline () {
  const w = $('tline').clientWidth,
    narrow = w < 520,
    h = 110,
    base = h - 34
  tl.attr('viewBox', `0 0 ${w} ${h}`).selectAll('*').remove()
  tlx = d3.scaleLinear([1819, 1969], [12, w - 12])
  const sy = d3.scaleLinear([0, PEAK.n], [base, base - 22])
  const ser = SERIES.filter(d => d.y >= 1819)
  tl.append('path')
    .datum(ser)
    .attr('fill', '#8c5a3c')
    .attr('fill-opacity', 0.14)
    .attr(
      'd',
      d3
        .area()
        .x(d => tlx(d.y))
        .y0(base)
        .y1(d => sy(d.n))
    )
  tl.append('line')
    .attr('x1', tlx(1819))
    .attr('x2', tlx(1969))
    .attr('y1', base)
    .attr('y2', base)
    .attr('stroke', '#2d2d2d')
    .attr('stroke-width', 0.7)
  d3.range(1820, 1970, 5).forEach(y =>
    tl
      .append('line')
      .attr('x1', tlx(y))
      .attr('x2', tlx(y))
      .attr('y1', base)
      .attr('y2', base + (y % 25 ? 3 : 6))
      .attr('stroke', '#2d2d2d')
      .attr('stroke-width', 0.6)
  )
  d3.range(1825, 1970, 25).forEach(y =>
    tl
      .append('text')
      .attr('x', tlx(y))
      .attr('y', base + 18)
      .attr('text-anchor', 'middle')
      .text(y)
  )
  const rows = [12, 26, 40],
    used = rows.map(() => [])
  EVENTS.forEach(([y, label], i) => {
    const x = tlx(y),
      anchor = i === 0 ? 'start' : i === EVENTS.length - 1 ? 'end' : 'middle'
    const g = tl
      .append('g')
      .style('cursor', 'pointer')
      .on('pointerdown', e => {
        e.stopPropagation()
        stopPlay()
        setYearMode(true)
        setYear(y)
      })
    const txt = g
      .append('text')
      .attr('class', 'ev')
      .attr('x', x)
      .attr('text-anchor', anchor)
      .style('font-size', narrow ? '10px' : null)
      .text(narrow ? y : `${y} ${label}`)
    const tw = txt.node().getComputedTextLength(),
      l = anchor === 'start' ? x : anchor === 'end' ? x - tw : x - tw / 2,
      r = l + tw
    let row = rows.findIndex((_, k) =>
      used[k].every(([a, b]) => r + 8 < a || l - 8 > b)
    )
    if (row < 0) row = rows.length - 1
    used[row].push([l, r])
    txt.attr('y', rows[row])
    g.insert('line', 'text')
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', rows[row] + 4)
      .attr('y2', base - 9)
      .attr('stroke', '#b9b9b9')
      .attr('stroke-width', 0.6)
    g.insert('line', 'text')
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', base - 9)
      .attr('y2', base)
      .attr('stroke', '#a8432f')
      .attr('stroke-width', 1.6)
    g.append('title').text(`${y}: ${label}`)
  })
  tl.append('g').attr('class', 'now')
  drawNow()
}
function drawNow () {
  if (!tlx) return
  const g = tl.select('g.now'),
    h = +tl.attr('viewBox').split(' ')[3],
    base = h - 34
  g.selectAll('*').remove()
  tl.attr('aria-valuenow', yearMode ? year : null).attr(
    'aria-valuetext',
    yearMode ? `${year}` : 'All years'
  )
  if (!yearMode) return
  g.append('line')
    .attr('x1', tlx(year))
    .attr('x2', tlx(year))
    .attr('y1', 4)
    .attr('y2', base)
    .attr('stroke', '#2d2d2d')
    .attr('stroke-width', 1)
  g.append('circle')
    .attr('cx', tlx(year))
    .attr('cy', base)
    .attr('r', 4)
    .attr('fill', '#2d2d2d')
}
function yearAt (e) {
  const r = tl.node().getBoundingClientRect()
  return tlx.invert(
    ((e.clientX - r.left) * +tl.attr('viewBox').split(' ')[2]) / r.width
  )
}
let dragging = false
tl.on('pointerdown', e => {
  dragging = true
  tl.node().setPointerCapture(e.pointerId)
  stopPlay()
  setYearMode(true)
  setYear(yearAt(e))
})
  .on('pointermove', e => {
    if (dragging) setYear(yearAt(e))
  })
  .on('pointerup pointercancel', () => {
    dragging = false
  })
tl.on('keydown', e => {
  const step = e.shiftKey ? 10 : 1
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault()
    stopPlay()
    if (!yearMode) setYearMode(true)
    setYear(year + (e.key === 'ArrowRight' ? step : -step))
  }
})

/* ---------- zoom controls; wheel hands back to the page at the limits ---------- */
const zMax = 14,
  kToSlider = k => Math.round((Math.log(k) / Math.log(zMax)) * 100),
  sliderToK = v => Math.pow(zMax, v / 100)
function syncSlider () {
  $('zr').value = kToSlider(K)
}
function zoomTo (k, center, dur = 0) {
  const c = center || [W / 2, H / 2]
  ;(dur ? svg.transition().duration(dur) : svg).call(
    zoom.scaleTo,
    Math.max(1, Math.min(zMax, k)),
    c
  )
}
$('zr').oninput = e => zoomTo(sliderToK(+e.target.value))
$('zin').onclick = () => zoomTo(K * 1.5, null, 250)
$('zout').onclick = () => zoomTo(K / 1.5, null, 250)
$('recenter').onclick = () => recenter()
function recenter (dur = 450) {
  svg.transition().duration(dur).call(zoom.transform, d3.zoomIdentity)
}
svg.node().addEventListener(
  'wheel',
  e => {
    if (e.ctrlKey && Math.abs(e.deltaY) < 1) return
    const next = Math.max(1, Math.min(zMax, K * Math.exp(-e.deltaY * 0.0016)))
    if (Math.abs(next - K) < 1e-3) return
    e.preventDefault()
    const r = svg.node().getBoundingClientRect()
    svg.call(zoom.scaleTo, next, [
      ((e.clientX - r.left) * W) / r.width,
      ((e.clientY - r.top) * H) / r.height
    ])
  },
  { passive: false }
)
function flyTo (s, k = 5) {
  if (!s?.p) return
  const t = d3.zoomIdentity
    .translate(W / 2, H / 2)
    .scale(k)
    .translate(-s.p[0], -s.p[1])
  svg
    .transition()
    .duration(matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 750)
    .call(zoom.transform, t)
}
$('fs').onclick = async () => {
  try {
    document.fullscreenElement
      ? await document.exitFullscreen()
      : await stageEl.requestFullscreen()
  } catch {}
}

/* ---------- tooltip ---------- */
const tip = $('tip')
const years = s =>
  `${s.s ?? 'Undated'}${s.o ? ' to present' : s.e ? '–' + s.e : ''}`
function showTip (e, d) {
  const r = stageEl.getBoundingClientRect()
  tip.innerHTML = `<b>${esc(d.n)}</b><small>${esc(d.l)} · ${years(d)}<br>${
    catName[d.c]
  }${
    d.d
      ? `<br>${d.d} death${
          d.d === 1 ? '' : 's'
        } documented by The Washington Post`
      : ''
  }</small>`
  let x = e.clientX - r.left + 14,
    y = e.clientY - r.top + 14
  if (x + 290 > r.width) x = e.clientX - r.left - 14 - tip.offsetWidth
  tip.style.transform = `translate(${x}px,${y}px)`
  tip.classList.add('on')
}
function hideTip () {
  tip.classList.remove('on')
}

/* ---------- callouts on the stage ---------- */
const DIRS = {
  carlisle: [1, -0.55],
  chemawa: [-1, 0.1],
  haskell: [1, 0.5],
  genoa: [1, -0.35],
  chilocco: [0.35, 1],
  rapidcity: [-1, -0.7],
  holyrosary: [-1, 0.55],
  stfrancis: [0.7, -1]
}
const calls = FEATURED.filter(f => f.id).map(f => {
  const lead = Object.assign(document.createElement('span'), {
    className: 'lead off'
  })
  const lab = Object.assign(document.createElement('button'), {
    className: 'call off',
    textContent: f.name
  })
  lab.style.setProperty('--accent', f.accent)
  lab.onclick = () => select(f.key)
  $('calls').append(lead, lab)
  return { f, lead, lab }
})
function placeCalls () {
  const ox = mapEl.offsetLeft,
    oy = mapEl.offsetTop,
    sw = stageEl.clientWidth,
    small = sw < 600
  const placed = []
  calls.forEach(c => {
    const s = c.f.s,
      hide =
        !s.p ||
        !shownCats.has(s.c) ||
        (yearMode && !isOpen(s, year)) ||
        (K > 3.2 && current !== c.f) ||
        (small &&
          current !== c.f &&
          K < 1.01 &&
          !['carlisle', 'chemawa', 'chilocco', 'rapidcity'].includes(c.f.key))
    const x = T.applyX(s.p[0]) + ox,
      y = T.applyY(s.p[1]) + oy
    const out = x < ox - 4 || x > ox + W + 4 || y < oy - 4 || y > oy + H + 4
    ;[c.lab, c.lead].forEach(el => el.classList.toggle('off', hide || out))
    c.lab.classList.toggle('on', current === c.f)
    if (hide || out) return
    const [dx, dy] = DIRS[c.f.key],
      reach = small ? 34 : 54,
      lw = c.lab.offsetWidth,
      lh = c.lab.offsetHeight
    let lx = x + dx * reach,
      ly = y + dy * reach * 0.8
    let left = dx < 0 ? lx - lw : lx
    left = Math.max(4, Math.min(sw - lw - 4, left))
    ly = Math.max(oy + 10, Math.min(oy + H - 10, ly))
    for (const p of placed)
      if (left < p.r + 4 && left + lw > p.l - 4 && Math.abs(ly - p.y) < lh + 2)
        ly = p.y + (ly >= p.y ? lh + 2 : -(lh + 2))
    placed.push({ l: left, r: left + lw, y: ly })
    c.lab.style.transform = `translate(${left}px,${ly - lh / 2}px)`
    const ex = dx < 0 ? left + lw - 2 : left + 2,
      ey = ly,
      L = Math.hypot(x - ex, y - ey)
    c.lead.style.width = Math.max(0, L - 5) + 'px'
    c.lead.style.transform = `translate(${ex}px,${ey}px) rotate(${Math.atan2(
      y - ey,
      x - ex
    )}rad)`
  })
}

/* ---------- cards ---------- */
const chev =
  '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>'
$('list').innerHTML = FEATURED.map(
  f =>
    `<button class="card glass" data-k="${
      f.key
    }" aria-pressed="false" style="--accent:${
      f.accent
    }"><svg class="loc" viewBox="0 0 144 116" aria-hidden="true"></svg><span><b>${esc(
      f.name
    )}</b><small>${f.card
      .split(' · ')
      .map(esc)
      .join('<br>')}</small></span>${chev}</button>`
).join('')
document
  .querySelectorAll('.card')
  .forEach(b => (b.onclick = () => select(b.dataset.k)))
$('count').textContent = `${SCHOOLS.length} schools mapped`
function thumbs () {
  const pj = d3.geoAlbersUsa().fitExtent(
      [
        [6, 8],
        [138, 108]
      ],
      states
    ),
    pa = d3.geoPath(pj)
  const base = `<path d="${pa(
    nation
  )}" fill="#f4f4f4" stroke="#8a8a8a" stroke-width=".9"/>`
  FEATURED.forEach(f => {
    const el = document.querySelector(`.card[data-k="${f.key}"] svg`)
    if (f.id) {
      const p = pj([f.s.x, f.s.y])
      el.innerHTML =
        base +
        `<circle cx="${p[0]}" cy="${p[1]}" r="11" fill="${f.accent}" opacity=".16"/><circle cx="${p[0]}" cy="${p[1]}" r="4.2" fill="${f.accent}" stroke="#fff" stroke-width="1"/>`
    } else
      el.innerHTML =
        base +
        SCHOOLS.filter(s => s.p)
          .map(s => {
            const p = pj([s.x, s.y])
            return p
              ? `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(
                  1
                )}" r="1.15" fill="${catColour[s.c]}"/>`
              : ''
          })
          .join('')
  })
}

/* ---------- panel ---------- */
let current = null,
  sel = null
function tab (name) {
  ;['record', 'timeline', 'sources'].forEach(t => {
    $('t-' + t).setAttribute('aria-selected', t === name)
    $('p-' + t).hidden = t !== name
  })
}
;['record', 'timeline', 'sources'].forEach(
  t => ($('t-' + t).onclick = () => tab(t))
)
document.querySelectorAll('nav a[data-tab]').forEach(
  a =>
    (a.onclick = () => {
      tab(a.dataset.tab)
      if (innerWidth <= 1240)
        $('panel').scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
)
document.querySelector('nav a[data-go=schools]').onclick = () =>
  document
    .getElementById('schools')
    .scrollIntoView({ behavior: 'smooth', block: 'nearest' })
document.querySelector('nav a[data-go=overview]').onclick = e => {
  e.preventDefault()
  select('overview')
}
const srcItem = x => {
  const [label, url] = typeof x === 'string' ? src[x] : x
  return `<li><a href="${url}" target="_blank" rel="noopener">${esc(
    label
  )}</a><small>${esc(new URL(url).hostname.replace('www.', ''))}</small></li>`
}
function setAccent (a, s) {
  const r = document.documentElement.style
  r.setProperty('--accent', a)
  r.setProperty('--accent-soft', s)
}
function kv (rows) {
  $('kv').innerHTML = rows
    .map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`)
    .join('')
}
function header (kick, num, title, lede) {
  $('kName').textContent = kick
  $('kNum').textContent = num
  $('title').textContent = title
  $('title').classList.toggle('long', title.length > 26)
  $('lede').textContent = lede
}
function recordCards (f) {
  $('p-record').innerHTML =
    (f.key === 'overview' ? chartHTML() + topHTML() + opsHTML() : '') +
    f.record
      .map(
        ([n, s, l, m], i) =>
          `<div class="st" data-i="${i}"><button aria-expanded="false"><span><b>${esc(
            n
          )}</b><span class="s">${esc(
            s
          )}</span></span><i class="pm" aria-hidden="true">+</i></button><div class="more">${esc(
            l
          )}${
            m && f.s
              ? ' <a role="button" tabindex="0" data-show>Show on map</a>'
              : ''
          }</div></div>`
      )
      .join('') +
    (f.note ? `<p class="note">${esc(f.note)}</p>` : '')
  $('p-record')
    .querySelectorAll('.st')
    .forEach(el => {
      const b = el.querySelector('button')
      b.onclick = () => {
        const open = !el.classList.contains('open')
        el.classList.toggle('open', open)
        b.setAttribute('aria-expanded', open)
        el.querySelector('.pm').textContent = open ? '−' : '+'
      }
      const show = el.querySelector('[data-show]')
      if (show)
        show.onclick = show.onkeydown = e => {
          if (e.type === 'keydown' && e.key !== 'Enter') return
          flyTo(f.s, 7)
          stageEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    })
  if (f.key === 'overview') {
    wireChart()
    $('p-record')
      .querySelectorAll('.top button')
      .forEach(
        b =>
          (b.onclick = () => {
            const s = byId.get(+b.dataset.id)
            featById.has(s.id)
              ? select(featById.get(s.id).key)
              : selectSchool(s)
          })
      )
  }
}
function select (k) {
  const f = featByKey[k],
    i = FEATURED.indexOf(f)
  current = f
  sel = f.s || null
  setAccent(f.accent, f.soft)
  document
    .querySelectorAll('.card')
    .forEach(b => b.setAttribute('aria-pressed', b.dataset.k === k))
  header(f.key === 'overview' ? 'Overview' : f.s.l, '', f.title, f.lede)
  kv(f.kv)
  recordCards(f)
  $('p-timeline').innerHTML = `<ul class="tl">${f.timeline
    .map(
      ([y, t]) =>
        `<li class="${
          y <= 1969 ? 'yr' : ''
        }" data-y="${y}"><b>${y}</b><span>${esc(t)}</span></li>`
    )
    .join(
      ''
    )}</ul><p class="note">Select a year up to 1969 to show the schools open that year.</p>`
  $('p-timeline')
    .querySelectorAll('li.yr')
    .forEach(
      li =>
        (li.onclick = () => {
          setYearMode(true)
          setYear(+li.dataset.y)
        })
    )
  $('p-sources').innerHTML = `<p class="know">${esc(
    f.know
  )}</p><div class="chips">${f.chips
    .map(x => `<span>${esc(x)}</span>`)
    .join('')}</div><ul class="src">${f.sources.map(srcItem).join('')}${
    f.s
      ? srcItem([
          'NABS and NCTR inventory record for this school',
          f.s.u || src.nabsMap[1]
        ])
      : ''
  }</ul><p class="note">Nation chips name some of the nations whose children attended, as reported in the sources; they are not complete lists.</p>`
  if (f.key === 'overview') {
    $('p-sources').querySelector('.note').textContent =
      'Chips name the kinds of institutions in the inventory.'
    recenter()
  } else flyTo(f.s, 4)
  applyFilter()
  try {
    history.replaceState(null, '', '#' + k)
  } catch {}
}
function selectSchool (s) {
  current = null
  sel = s
  setAccent(
    catColour[s.c],
    s.c === 'C' ? '#f5e3e1' : s.c === 'P' ? '#e2ebe7' : '#ece6df'
  )
  document
    .querySelectorAll('.card')
    .forEach(b => b.setAttribute('aria-pressed', false))
  header(
    `Inventory record, ${s.st}`,
    catName[s.c],
    s.n,
    s.l + (s.v ? `. Also recorded as ${s.v.replace(/;\s*/g, ', ')}.` : '.')
  )
  kv([
    ['Opened', s.sd || 'Not recorded'],
    ['Closed', s.o ? 'Still operating' : s.ed || 'Not recorded'],
    ['Operator', s.op || 'Not recorded'],
    [
      'Deaths documented',
      s.d != null ? String(s.d) : 'Outside the Post’s study'
    ]
  ])
  $('p-record').innerHTML =
    (s.g
      ? `<p class="prose">${esc(
          s.g
        )}</p><p class="note">Narrative by the U.S. Department of the Interior, from the inventory record.</p>`
      : '<p class="prose">This inventory record has no Interior Department narrative. The NABS record may hold more.</p>') +
    (s.t
      ? `<p class="note">School type in the inventory: ${esc(s.t)}.</p>`
      : '') +
    (s.d != null
      ? `<p class="note">Deaths: The Washington Post documented ${s.d}; the Interior Department’s Volume II documented ${s.dg}.</p>`
      : '<p class="note">The Washington Post counted deaths only at the 417 federally funded schools on the Interior Department’s list; this school is not among them.</p>')
  if (s.fix)
    $('p-record').innerHTML +=
      '<p class="note">Map dates corrected from the inventory record to those in the Interior Department’s narrative.</p>'
  $('p-timeline').innerHTML = `<ul class="tl">${
    s.s
      ? `<li class="yr" data-y="${s.s}"><b>${s.s}</b><span>Opens${
          s.sd && s.sd.length > 4 ? ' (' + esc(s.sd) + ')' : ''
        }.</span></li>`
      : ''
  }${
    s.e
      ? `<li class="yr" data-y="${Math.min(s.e, 1969)}"><b>${
          s.e
        }</b><span>Closes.</span></li>`
      : ''
  }${
    s.o ? '<li><b>Today</b><span>Recorded as still operating.</span></li>' : ''
  }</ul>`
  $('p-timeline')
    .querySelectorAll('li.yr')
    .forEach(
      li =>
        (li.onclick = () => {
          setYearMode(true)
          setYear(+li.dataset.y)
        })
    )
  $('p-sources').innerHTML = `<ul class="src">${
    s.u ? srcItem(['NABS digital archive record (NIBSDA)', s.u]) : ''
  }${s.d != null ? srcItem('wapoData') : ''}${srcItem('nabsMap')}${srcItem(
    'vol2'
  )}</ul>`
  flyTo(s, Math.max(K, 5))
  applyFilter()
  if (innerWidth <= 1240)
    $('panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

/* ---------- overview chart ---------- */
function chartHTML () {
  return `<div class="chart"><h3>Schools in Operation, 1800 to 1969</h3><p>Boarding schools open in each year. Select a year to show it on the map.</p><svg id="chart" viewBox="0 0 340 170" aria-label="Line chart of schools in operation each year, peaking at ${PEAK.n} in ${PEAK.y}"></svg></div>`
}
function topHTML () {
  const top = SCHOOLS.filter(s => s.d)
      .sort((a, b) => b.d - a.d)
      .slice(0, 12),
    max = top[0].d
  return `<div class="ops top"><h3>Most Deaths Documented</h3><p>The Washington Post’s count for each school.</p>${top
    .map(
      s =>
        `<button data-id="${s.id}"><span>${esc(
          s.n
            .replace(
              / (Indian )?(Industrial |Training |Agricultural |Boarding )*(School|Institute)$/,
              ''
            )
            .replace(/Indian Industrial Training$/, '')
        )}</span><i style="width:${(s.d / max) * 100}%;background:${
          catColour[s.c]
        }"></i><em>${s.d}</em></button>`
    )
    .join('')}</div>`
}
function opsHTML () {
  const max = Math.max(...Object.values(catCount))
  return `<div class="ops" aria-label="Schools by operator"><h3>Schools by Operator</h3>${CATS.map(
    ([k, n, c]) =>
      `<div><span>${n}</span><i style="width:${
        (catCount[k] / max) * 100
      }%;background:${c}"></i><em>${catCount[k]}</em></div>`
  ).join('')}</div>`
}
function wireChart () {
  const el = d3.select('#chart'),
    m = { l: 34, r: 10, t: 10, b: 24 },
    w = 340,
    h = 170
  const x = d3.scaleLinear([1800, 1969], [m.l, w - m.r]),
    y = d3.scaleLinear([0, Math.ceil(PEAK.n / 50) * 50], [h - m.b, m.t])
  el.append('path')
    .datum(SERIES)
    .attr('fill', '#8c5a3c')
    .attr('fill-opacity', 0.16)
    .attr(
      'd',
      d3
        .area()
        .x(d => x(d.y))
        .y0(y(0))
        .y1(d => y(d.n))
    )
  el.append('path')
    .datum(SERIES)
    .attr('fill', 'none')
    .attr('stroke', '#8c5a3c')
    .attr('stroke-width', 1.4)
    .attr(
      'd',
      d3
        .line()
        .x(d => x(d.y))
        .y(d => y(d.n))
    )
  const ax = el.append('g').attr('transform', `translate(0,${h - m.b})`)
  ax.append('line')
    .attr('x1', m.l)
    .attr('x2', w - m.r)
    .attr('stroke', '#2d2d2d')
    .attr('stroke-width', 0.6)
  d3.range(1800, 1970, 5).forEach(t =>
    ax
      .append('line')
      .attr('x1', x(t))
      .attr('x2', x(t))
      .attr('y2', t % 25 ? 2 : 4)
      .attr('stroke', '#2d2d2d')
      .attr('stroke-width', 0.6)
  )
  ;[1800, 1825, 1850, 1875, 1900, 1925, 1950].forEach(t =>
    ax
      .append('text')
      .attr('x', x(t))
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text(t)
  )
  const ay = el.append('g')
  ay.append('line')
    .attr('x1', m.l)
    .attr('x2', m.l)
    .attr('y1', m.t)
    .attr('y2', h - m.b)
    .attr('stroke', '#2d2d2d')
    .attr('stroke-width', 0.6)
  d3.range(0, y.domain()[1] + 1, 25).forEach(t =>
    ay
      .append('line')
      .attr('x1', m.l)
      .attr('x2', m.l - (t % 50 ? 2 : 4))
      .attr('y1', y(t))
      .attr('y2', y(t))
      .attr('stroke', '#2d2d2d')
      .attr('stroke-width', 0.6)
  )
  d3.range(0, y.domain()[1] + 1, 50).forEach(t =>
    ay
      .append('text')
      .attr('x', m.l - 7)
      .attr('y', y(t) + 3.5)
      .attr('text-anchor', 'end')
      .text(t)
  )
  el.append('circle')
    .attr('cx', x(PEAK.y))
    .attr('cy', y(PEAK.n))
    .attr('r', 2.6)
    .attr('fill', '#8c5a3c')
  el.append('text')
    .attr('x', x(PEAK.y) - 6)
    .attr('y', y(PEAK.n) + 3)
    .attr('text-anchor', 'end')
    .text(`${PEAK.n} schools in ${PEAK.y}`)
  const cur = el.append('g').style('display', 'none')
  cur
    .append('line')
    .attr('y1', m.t)
    .attr('y2', h - m.b)
    .attr('stroke', '#2d2d2d')
    .attr('stroke-width', 0.5)
  const ct = cur.append('text').attr('y', m.t + 8)
  el.on('pointermove', e => {
    const [px] = d3.pointer(e),
      yy = Math.round(Math.max(1819, Math.min(1969, x.invert(px)))),
      d = SERIES.find(s => s.y === yy)
    cur.style('display', null).attr('transform', `translate(${x(yy)},0)`)
    ct.attr('x', yy > 1900 ? -4 : 4)
      .attr('text-anchor', yy > 1900 ? 'end' : 'start')
      .text(`${yy}: ${d.n}`)
  })
    .on('pointerleave', () => cur.style('display', 'none'))
    .on('click', e => {
      const [px] = d3.pointer(e)
      setYearMode(true)
      setYear(Math.round(x.invert(px)))
      stageEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
}

/* ---------- search across all schools ---------- */
const INDEX = SCHOOLS.map(s => ({
  s,
  t: `${s.n} ${s.v} ${s.l} ${s.op}`.toLowerCase()
}))
let hits = [],
  hi = -1
$('q').oninput = e => {
  const q = e.target.value.trim().toLowerCase(),
    box = $('results')
  const words = q.split(/\s+/).filter(Boolean)
  hits = words.length
    ? INDEX.filter(x => words.every(w => x.t.includes(w)))
        .sort(
          (a, b) =>
            featById.has(b.s.id) - featById.has(a.s.id) ||
            (a.s.n.toLowerCase().startsWith(words[0]) ? -1 : 0)
        )
        .slice(0, 10)
    : []
  hi = -1
  box.innerHTML = hits.length
    ? hits
        .map(
          (x, i) =>
            `<button role="option" data-i="${i}">${esc(x.s.n)}<small>${esc(
              x.s.l
            )} · ${years(x.s)}${
              x.s.d ? ` · ${x.s.d} deaths` : ''
            }</small></button>`
        )
        .join('')
    : q
    ? '<button disabled>No matching schools</button>'
    : ''
  box.classList.toggle('on', !!q)
  box
    .querySelectorAll('[data-i]')
    .forEach(b => (b.onclick = () => pick(hits[b.dataset.i].s)))
}
function pick (s) {
  $('results').classList.remove('on')
  $('q').value = ''
  $('q').blur()
  featById.has(s.id) ? select(featById.get(s.id).key) : selectSchool(s)
}
$('q').onkeydown = e => {
  const btns = [...$('results').querySelectorAll('[data-i]')]
  if (e.key === 'Escape') {
    e.target.value = ''
    $('results').classList.remove('on')
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    if (!btns.length) return
    hi = (hi + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length
    btns.forEach((b, i) => b.classList.toggle('hi', i === hi))
    btns[hi].scrollIntoView({ block: 'nearest' })
  } else if (e.key === 'Enter' && hits.length) pick(hits[Math.max(0, hi)].s)
}
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('.search')) $('results').classList.remove('on')
})

/* ---------- start ---------- */
let lastW = 0
new ResizeObserver(() => {
  if (mapEl.clientWidth === lastW) return
  lastW = mapEl.clientWidth
  draw()
  svg.call(zoom.transform, d3.zoomIdentity)
}).observe(mapEl)
draw()
const start = location.hash.slice(1)
select(featByKey[start] ? start : 'overview')
addEventListener('hashchange', () => {
  const k = location.hash.slice(1)
  if (featByKey[k] && current?.key !== k) select(k)
})
