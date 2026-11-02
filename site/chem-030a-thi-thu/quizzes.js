// CHEM 030A Exam 2 quizzes. Everything after "window.QUIZZES =" is strict JSON so check_keys.py can read it.
// Question types: mc (choices c, answer index a), num (number a, relative tolerance tol), text (accepted answers a, norm: name|formula|cfg), coef (coefficient list a).
window.QUIZZES = [
{
  "id": "ch4-a", "chapter": "Chapter 4", "title": "Atoms, isotopes and ions", "minutes": 12,
  "src": ["Atoms and Ions (instructor notes)", "Activity 02-1 Atoms, Isotopes, and Ions + solutions", "Homework - Chapter 4", "Quiz - Chapter 4"],
  "qs": [
    {"t": "mc", "q": "Which subatomic particle has a charge of 1&minus;?", "c": ["Proton", "Neutron", "Electron", "Nucleus"], "a": 2, "e": "Electrons are &minus;1, protons are +1, and neutrons have no charge (Activity 02-1, Table 1)."},
    {"t": "mc", "q": "Which two particles have almost the same mass?", "c": ["Proton and electron", "Proton and neutron", "Neutron and electron", "All three are equal"], "a": 1, "e": "Proton 1.0073 amu and neutron 1.0087 amu; the electron is only 0.0005 amu."},
    {"t": "mc", "q": "The atomic number (Z) of an atom equals the number of its", "c": ["neutrons", "protons", "protons plus neutrons", "electrons plus neutrons"], "a": 1, "e": "Z counts protons. The number of protons defines which element it is."},
    {"t": "mc", "q": "The mass number (A) of an atom equals", "c": ["protons + electrons", "protons + neutrons", "neutrons only", "protons only"], "a": 1, "e": "A = protons + neutrons, the particles in the nucleus."},
    {"t": "num", "q": "How many neutrons are in <sup>127</sup><sub>53</sub>I?", "a": 74, "tol": 0, "unit": "neutrons", "calc": "127-53", "e": "Neutrons = A &minus; Z = 127 &minus; 53 = 74 (instructor notes)."},
    {"t": "num", "q": "How many electrons does the ion Sr<sup>2+</sup> have? (Z = 38)", "a": 36, "tol": 0, "unit": "electrons", "calc": "38-2", "e": "A 2+ cation has lost 2 electrons: 38 &minus; 2 = 36."},
    {"t": "num", "q": "How many electrons does the ion I<sup>&minus;</sup> have? (Z = 53)", "a": 54, "tol": 0, "unit": "electrons", "calc": "53+1", "e": "A 1&minus; anion has gained 1 electron: 53 + 1 = 54."},
    {"t": "mc", "q": "<sup>35</sup><sub>17</sub>Cl and <sup>37</sup><sub>17</sub>Cl are", "c": ["two different elements", "isotopes of chlorine", "ions of chlorine", "isotopes of argon"], "a": 1, "e": "Same Z (17 protons), different mass numbers (18 vs 20 neutrons): isotopes."},
    {"t": "mc", "q": "A particle has 8 protons, 8 neutrons and 10 electrons. It is", "c": ["O<sup>2+</sup>", "O<sup>2&minus;</sup>", "Ne", "F<sup>&minus;</sup>"], "a": 1, "e": "8 protons = oxygen. Two more electrons than protons gives a charge of 2&minus;."},
    {"t": "mc", "q": "A cation is an ion that has", "c": ["more electrons than protons", "fewer electrons than protons", "more neutrons than protons", "no electrons"], "a": 1, "e": "Losing electrons leaves extra positive charge. Na<sup>+</sup>: 11 protons, 10 electrons."},
    {"t": "num", "q": "Neon is 90.51% Ne-20 (19.99 amu), 0.27% Ne-21 (20.99 amu) and 9.22% Ne-22 (21.99 amu). What is the average atomic mass of neon?", "a": 20.18, "tol": 0.002, "unit": "amu", "calc": "0.9051*19.99+0.0027*20.99+0.0922*21.99", "e": "(0.9051 &times; 19.99) + (0.0027 &times; 20.99) + (0.0922 &times; 21.99) = 20.18 amu. Turn each percent into a decimal first."},
    {"t": "num", "q": "How many electrons are in the ion <sup>56</sup><sub>26</sub>Fe<sup>3+</sup>?", "a": 23, "tol": 0, "unit": "electrons", "calc": "26-3", "e": "26 protons; a 3+ ion lost 3 electrons: 26 &minus; 3 = 23. (Neutrons would be 56 &minus; 26 = 30.)"}
  ]
},
{
  "id": "ch4-b", "chapter": "Chapter 4", "title": "Periodic table and average atomic mass", "minutes": 12,
  "src": ["Atoms and Ions (instructor notes)", "Homework - Chapter 4", "Quiz - Chapter 4", "Homework - Chapter 5 Ionic Nomenclature (Q1 group names)", "Practice Problem for Midterm 2"],
  "qs": [
    {"t": "mc", "q": "Group 1A of the periodic table is called the", "c": ["halogens", "alkaline earth metals", "alkali metals", "noble gases"], "a": 2, "e": "1A = alkali metals (Na, K). 2A = alkaline earth metals. 7A = halogens. 8A = noble gases."},
    {"t": "mc", "q": "Calcium belongs to the", "c": ["alkali metals", "alkaline earth metals", "halogens", "transition metals"], "a": 1, "e": "Ca is in Group 2A, the alkaline earth metals."},
    {"t": "mc", "q": "Bromine (Br) is a", "c": ["noble gas", "halogen", "alkali metal", "transition metal"], "a": 1, "e": "Br is in Group 7A with F, Cl and I: the halogens."},
    {"t": "mc", "q": "Which element is a transition metal?", "c": ["Na", "Co", "Cl", "Xe"], "a": 1, "e": "Cobalt is a B-group (transition) metal. Na is alkali, Cl halogen, Xe noble gas."},
    {"t": "mc", "q": "The Group 8A (18) elements", "c": ["are very reactive metals", "are unreactive and rarely combine with other elements", "are all liquids at room temperature", "form 1+ ions"], "a": 1, "e": "The noble gases are unreactive (practice exam Q2)."},
    {"t": "mc", "q": "How are sodium and chlorine classified?", "c": ["Both are nonmetals", "Na is a metal, Cl is a nonmetal", "Both are metals", "Na is a nonmetal, Cl is a metal"], "a": 1, "e": "Both are main-group elements: Na a metal on the left, Cl a nonmetal on the right (Quiz Ch4 Q14)."},
    {"t": "mc", "q": "Which statement is NOT part of Dalton's atomic theory?", "c": ["Atoms are not created or destroyed", "All atoms of one element have the same mass", "Atoms combine in small whole-number ratios to form compounds", "Atoms of the same element with different masses are called isotopes"], "a": 3, "e": "Dalton said all atoms of an element have the same mass, so isotopes are not part of his theory (Quiz Ch4 Q1)."},
    {"t": "mc", "q": "Rutherford's scattering experiment showed that", "c": ["electrons hold most of the atom's mass", "the atom has a tiny, dense, positive nucleus", "matter is not made of atoms", "neutrons carry a charge"], "a": 1, "e": "Nearly all mass and all positive charge sit in a tiny nucleus; the rest is mostly empty space (Quiz Ch4 Q4&ndash;5)."},
    {"t": "num", "q": "Chlorine is 75.53% Cl-35 (34.96885 amu) and 24.47% Cl-37 (36.96590 amu). What is its average atomic mass?", "a": 35.46, "tol": 0.002, "unit": "amu", "calc": "0.7553*34.96885+0.2447*36.96590", "e": "(0.7553 &times; 34.96885) + (0.2447 &times; 36.96590) = 35.46 amu (instructor notes)."},
    {"t": "mc", "q": "Isotopes of an element differ in their number of", "c": ["protons", "electrons", "neutrons", "protons and neutrons"], "a": 2, "e": "Same protons, different neutrons, so different mass numbers."},
    {"t": "num", "q": "How many neutrons are in potassium-41? (K: Z = 19)", "a": 22, "tol": 0, "unit": "neutrons", "calc": "41-19", "e": "41 &minus; 19 = 22 neutrons (Quiz Ch4 Q10)."},
    {"t": "mc", "q": "Which pair are isotopes of each other: <sup>14</sup><sub>6</sub>X, <sup>12</sup><sub>6</sub>X, <sup>14</sup><sub>7</sub>X?", "c": ["<sup>14</sup><sub>6</sub>X and <sup>14</sup><sub>7</sub>X", "<sup>14</sup><sub>6</sub>X and <sup>12</sup><sub>6</sub>X", "<sup>12</sup><sub>6</sub>X and <sup>14</sup><sub>7</sub>X", "All three"], "a": 1, "e": "Isotopes share the bottom number (Z = 6) and differ in the top number (14 vs 12)."}
  ]
},
{
  "id": "ch5-a", "chapter": "Chapter 5", "title": "Ions and ionic compounds", "minutes": 15,
  "src": ["Table of Ions (Ch5 exercise PDFs)", "Instructor Note - Nomenclature of Ionic Compounds (Sep 13)", "Nomenclature of Inorganic Compounds (textbook) 6.2-6.5", "Nomenclature of Ionic Compounds (Exam 1 handout)", "Homework + Quiz - Chapter 5 Ionic"],
  "qs": [
    {"t": "mc", "q": "What is the formula of the sulfite ion?", "c": ["SO<sub>4</sub><sup>2&minus;</sup>", "SO<sub>3</sub><sup>2&minus;</sup>", "S<sup>2&minus;</sup>", "HSO<sub>3</sub><sup>&minus;</sup>"], "a": 1, "e": "Sulfate SO<sub>4</sub><sup>2&minus;</sup>; sulfite has one less O: SO<sub>3</sub><sup>2&minus;</sup>. Sulfide is S<sup>2&minus;</sup>."},
    {"t": "mc", "q": "What is the charge of the phosphate ion, PO<sub>4</sub>?", "c": ["1&minus;", "2&minus;", "3&minus;", "3+"], "a": 2, "e": "Phosphate is PO<sub>4</sub><sup>3&minus;</sup> (Table of Ions)."},
    {"t": "mc", "q": "An ion has 16 protons and 18 electrons. Its symbol and name are", "c": ["S<sup>2&minus;</sup>, sulfide ion", "S<sup>2+</sup>, sulfur ion", "Ar, argon", "Cl<sup>&minus;</sup>, chloride ion"], "a": 0, "e": "16 protons = sulfur; 2 extra electrons = 2&minus;. Monatomic anions end in -ide."},
    {"t": "mc", "q": "Aluminum and oxygen form an ionic compound. Its formula is", "c": ["AlO", "Al<sub>2</sub>O<sub>3</sub>", "Al<sub>3</sub>O<sub>2</sub>", "AlO<sub>3</sub>"], "a": 1, "e": "Al<sup>3+</sup> and O<sup>2&minus;</sup>: 2(+3) + 3(&minus;2) = 0, so Al<sub>2</sub>O<sub>3</sub>."},
    {"t": "text", "norm": "name", "q": "Name CuBr<sub>2</sub>.", "a": ["copper(II) bromide", "cupric bromide"], "e": "2 Br<sup>&minus;</sup> = &minus;2, so copper is Cu<sup>2+</sup>: copper(II) bromide (instructor note)."},
    {"t": "text", "norm": "formula", "q": "Write the formula for magnesium phosphate.", "a": ["Mg3(PO4)2"], "e": "Mg<sup>2+</sup> and PO<sub>4</sub><sup>3&minus;</sup>: 3(+2) + 2(&minus;3) = 0, so Mg<sub>3</sub>(PO<sub>4</sub>)<sub>2</sub>. Parentheses around the polyatomic ion."},
    {"t": "mc", "q": "Name Pb(SO<sub>4</sub>)<sub>2</sub>.", "c": ["lead sulfate", "lead(II) sulfate", "lead(IV) sulfate", "lead disulfate"], "a": 2, "e": "2 &times; SO<sub>4</sub><sup>2&minus;</sup> = &minus;4, so Pb<sup>4+</sup>: lead(IV) sulfate (instructor note, Sep 13)."},
    {"t": "mc", "q": "Name FeCl<sub>3</sub>.", "c": ["iron chloride", "iron(II) chloride", "iron(III) chloride", "iron trichloride"], "a": 2, "e": "3 Cl<sup>&minus;</sup> = &minus;3, so Fe<sup>3+</sup>. Ionic names never use prefixes like tri-."},
    {"t": "mc", "q": "Which is the formula for ammonium sulfate?", "c": ["NH<sub>4</sub>SO<sub>4</sub>", "(NH<sub>4</sub>)<sub>2</sub>SO<sub>4</sub>", "NH<sub>4</sub>(SO<sub>4</sub>)<sub>2</sub>", "(NH<sub>4</sub>)<sub>3</sub>SO<sub>4</sub>"], "a": 1, "e": "NH<sub>4</sub><sup>+</sup> and SO<sub>4</sub><sup>2&minus;</sup>: two ammonium ions balance one sulfate."},
    {"t": "text", "norm": "name", "q": "Name NaHCO<sub>3</sub>.", "a": ["sodium hydrogen carbonate", "sodium bicarbonate"], "e": "Na<sup>+</sup> and HCO<sub>3</sub><sup>&minus;</sup> (hydrogen carbonate, also called bicarbonate)."},
    {"t": "mc", "q": "The correct name for K<sub>2</sub>S is", "c": ["potassium(II) sulfide", "potassium sulfide", "dipotassium sulfide", "potassium sulfite"], "a": 1, "e": "Group 1A metals have only one charge (+1), so no Roman numeral and no prefix (Quiz Ch5 Q7)."},
    {"t": "text", "norm": "formula", "q": "Write the formula for iron(III) sulfide.", "a": ["Fe2S3"], "e": "Fe<sup>3+</sup> and S<sup>2&minus;</sup>: 2(+3) + 3(&minus;2) = 0, so Fe<sub>2</sub>S<sub>3</sub> (Exam 1 handout)."},
    {"t": "mc", "q": "Which compound contains an ion with a 3+ charge?", "c": ["KCl", "CuCl<sub>2</sub>", "CrCl<sub>3</sub>", "Na<sub>2</sub>O"], "a": 2, "e": "3 Cl<sup>&minus;</sup> balance one Cr<sup>3+</sup>. K<sup>+</sup>, Cu<sup>2+</sup> and Na<sup>+</sup> are the others."}
  ]
},
{
  "id": "ch5-b", "chapter": "Chapter 5", "title": "Molecular compounds and acids", "minutes": 14,
  "src": ["Ch5 - Molecular Compounds Nomenclature (page)", "Instructor Notes on Molecular Compounds (Sep 17)", "Nomenclature of Inorganic Compounds (textbook) 6.4, 6.6", "Nomenclature Summary (flowchart)", "Practice Problem for Midterm 2"],
  "qs": [
    {"t": "text", "norm": "name", "q": "Name N<sub>2</sub>O<sub>5</sub>.", "a": ["dinitrogen pentoxide", "dinitrogen pentaoxide"], "e": "2 N = di, 5 O = penta; the a drops before oxide: dinitrogen pentoxide."},
    {"t": "text", "norm": "name", "q": "Name CO.", "a": ["carbon monoxide"], "e": "No mono on the first element; the second gets mono- and -ide: carbon monoxide."},
    {"t": "mc", "q": "Name P<sub>4</sub>O<sub>6</sub>.", "c": ["phosphorus oxide", "tetraphosphorus hexoxide", "phosphorus(VI) oxide", "tetraphosphorus oxide"], "a": 1, "e": "Two nonmetals take prefixes for both elements (instructor notes, Sep 17)."},
    {"t": "text", "norm": "formula", "q": "Write the formula for nitrogen tribromide.", "a": ["NBr3"], "e": "No prefix on nitrogen = 1 N; tri = 3 Br."},
    {"t": "text", "norm": "formula", "q": "Write the formula for sulfur hexafluoride.", "a": ["SF6"], "e": "hexa = 6, so SF<sub>6</sub>. In molecular formulas the prefixes give the subscripts directly."},
    {"t": "mc", "q": "Which one is a molecular (covalent) compound?", "c": ["MgCl<sub>2</sub>", "SO<sub>2</sub>", "FePO<sub>4</sub>", "NaCl"], "a": 1, "e": "S and O are both nonmetals. The others contain a metal, so they are ionic."},
    {"t": "mc", "q": "Which prefix means 7?", "c": ["hexa", "hepta", "octa", "penta"], "a": 1, "e": "mono 1, di 2, tri 3, tetra 4, penta 5, hexa 6, hepta 7, octa 8, nona 9, deca 10."},
    {"t": "mc", "q": "Which element exists as a diatomic molecule?", "c": ["Neon", "Bromine", "Sodium", "Carbon"], "a": 1, "e": "The seven diatomic elements: H<sub>2</sub>, N<sub>2</sub>, O<sub>2</sub>, F<sub>2</sub>, Cl<sub>2</sub>, Br<sub>2</sub>, I<sub>2</sub>."},
    {"t": "mc", "q": "HCl(aq) is named", "c": ["hydrogen chloride", "hydrochloric acid", "chloric acid", "hydrochlorous acid"], "a": 1, "e": "Binary acid (no oxygen): hydro + root + -ic acid."},
    {"t": "mc", "q": "H<sub>2</sub>SO<sub>4</sub> is named", "c": ["sulfurous acid", "hydrosulfuric acid", "sulfuric acid", "dihydrogen sulfate"], "a": 2, "e": "From sulfate (-ate), so -ic acid: sulfuric acid."},
    {"t": "mc", "q": "HNO<sub>2</sub> is named", "c": ["nitric acid", "nitrous acid", "hydronitric acid", "hydrogen nitrate"], "a": 1, "e": "From nitrite (-ite), so -ous acid: nitrous acid."},
    {"t": "text", "norm": "name", "q": "Name HClO<sub>4</sub>.", "a": ["perchloric acid"], "e": "From perchlorate (-ate), so perchloric acid."},
    {"t": "text", "norm": "formula", "q": "Write the formula for hydrofluoric acid.", "a": ["HF"], "e": "hydro-...-ic means a binary acid: H<sup>+</sup> and F<sup>&minus;</sup>, HF(aq)."},
    {"t": "mc", "q": "H<sub>2</sub>S(aq) is named", "c": ["sulfuric acid", "hydrosulfuric acid", "sulfurous acid", "hydrogen sulfate"], "a": 1, "e": "No oxygen: hydro + sulf + -ic acid (textbook 6.6)."}
  ]
},
{
  "id": "ch7-a", "chapter": "Chapter 7", "title": "Writing and balancing equations", "minutes": 12,
  "src": ["Ch7 - Balancing (page)", "Ch7 - Discussion - Balancing", "Homework + Quiz - Chapter 7", "Chapter 8 - Stoichiometry worksheet Q16", "Chapter 7 video: Chemical Equation Writing"],
  "qs": [
    {"t": "mc", "q": "When you balance an equation, you may change", "c": ["subscripts", "coefficients", "both subscripts and coefficients", "the formulas of the products"], "a": 1, "e": "Only coefficients. Changing a subscript changes the substance (Balancing page, rules 2&ndash;3)."},
    {"t": "coef", "q": "Balance: __ H<sub>2</sub> + __ O<sub>2</sub> &rarr; __ H<sub>2</sub>O", "a": [2, 1, 2], "e": "2 H<sub>2</sub> + O<sub>2</sub> &rarr; 2 H<sub>2</sub>O: 4 H and 2 O on each side."},
    {"t": "coef", "q": "Balance: __ Al + __ O<sub>2</sub> &rarr; __ Al<sub>2</sub>O<sub>3</sub>", "a": [4, 3, 2], "e": "O: 3 O<sub>2</sub> = 6 = 2 Al<sub>2</sub>O<sub>3</sub>; then 4 Al."},
    {"t": "coef", "q": "Balance: __ CH<sub>4</sub> + __ O<sub>2</sub> &rarr; __ CO<sub>2</sub> + __ H<sub>2</sub>O", "a": [1, 2, 1, 2], "e": "C first (1), H next (4 H = 2 H<sub>2</sub>O), O last (2 + 2 = 4 O = 2 O<sub>2</sub>)."},
    {"t": "coef", "q": "Balance: __ C<sub>4</sub>H<sub>10</sub> + __ O<sub>2</sub> &rarr; __ CO<sub>2</sub> + __ H<sub>2</sub>O", "a": [2, 13, 8, 10], "e": "1 C<sub>4</sub>H<sub>10</sub> needs 13/2 O<sub>2</sub>; double everything to clear the fraction."},
    {"t": "coef", "q": "Balance: __ Zn + __ H<sub>3</sub>PO<sub>4</sub> &rarr; __ H<sub>2</sub> + __ Zn<sub>3</sub>(PO<sub>4</sub>)<sub>2</sub>", "a": [3, 2, 3, 1], "e": "Treat PO<sub>4</sub> as a unit: 2 PO<sub>4</sub> needs 2 H<sub>3</sub>PO<sub>4</sub>; 6 H = 3 H<sub>2</sub>; 3 Zn."},
    {"t": "coef", "q": "Balance: __ Ca(OH)<sub>2</sub> + __ H<sub>3</sub>PO<sub>4</sub> &rarr; __ Ca<sub>3</sub>(PO<sub>4</sub>)<sub>2</sub> + __ H<sub>2</sub>O", "a": [3, 2, 1, 6], "e": "3 Ca, 2 PO<sub>4</sub>; H: 6 (from OH) + 6 (from acid) = 12 = 6 H<sub>2</sub>O."},
    {"t": "coef", "q": "Balance: __ CO<sub>2</sub> + __ H<sub>2</sub>O &rarr; __ C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + __ O<sub>2</sub>", "a": [6, 6, 1, 6], "e": "6 C, 12 H, then O: 12 + 6 = 18 on the left = 6 + 12 on the right."},
    {"t": "coef", "q": "Balance: __ Al<sub>2</sub>(CO<sub>3</sub>)<sub>3</sub> + __ HCl &rarr; __ AlCl<sub>3</sub> + __ H<sub>2</sub>O + __ CO<sub>2</sub>", "a": [1, 6, 2, 3, 3], "e": "2 Al &rarr; 2 AlCl<sub>3</sub> = 6 Cl = 6 HCl; 3 C = 3 CO<sub>2</sub>; 6 H = 3 H<sub>2</sub>O."},
    {"t": "mc", "q": "After balancing __ Na + __ Cl<sub>2</sub> &rarr; __ NaCl, the sum of the coefficients is", "c": ["3", "4", "5", "6"], "a": 2, "e": "2 Na + 1 Cl<sub>2</sub> &rarr; 2 NaCl: 2 + 1 + 2 = 5. Count the 1s."},
    {"t": "mc", "q": "In a chemical equation, the symbol (aq) means the substance is", "c": ["a solid", "dissolved in water", "a gas", "a pure liquid"], "a": 1, "e": "(s) solid, (l) liquid, (g) gas, (aq) aqueous: dissolved in water."},
    {"t": "mc", "q": "Which equation is correctly balanced, with correct formulas?", "c": ["N<sub>2</sub> + H<sub>2</sub> &rarr; NH<sub>3</sub>", "N<sub>2</sub> + 3 H<sub>2</sub> &rarr; 2 NH<sub>3</sub>", "N<sub>2</sub> + 2 H<sub>3</sub> &rarr; 2 NH<sub>3</sub>", "N<sub>2</sub> + 3 H<sub>2</sub> &rarr; NH<sub>3</sub>"], "a": 1, "e": "Hydrogen gas is H<sub>2</sub>, never H<sub>3</sub>; 2 N and 6 H on each side (HW Ch7 Q7)."}
  ]
},
{
  "id": "ch7-b", "chapter": "Chapter 7", "title": "Classifying reactions", "minutes": 12,
  "src": ["Ch7 - Classifying Chemical Reactions (page)", "Homework + Quiz - Chapter 7", "Practice Problem for Midterm 2", "Study guide for Exam II"],
  "qs": [
    {"t": "mc", "q": "2 H<sub>2</sub>O &rarr; 2 H<sub>2</sub> + O<sub>2</sub> is a", "c": ["combination", "decomposition", "single replacement", "double replacement"], "a": 1, "e": "One compound breaks into simpler substances (practice exam)."},
    {"t": "mc", "q": "Mg + Cl<sub>2</sub> &rarr; MgCl<sub>2</sub> is a", "c": ["combination", "decomposition", "single replacement", "combustion"], "a": 0, "e": "Two substances join into one product (Quiz Ch7 Q7)."},
    {"t": "mc", "q": "Zn + 2 HCl &rarr; ZnCl<sub>2</sub> + H<sub>2</sub> is a", "c": ["combination", "decomposition", "single replacement", "double replacement"], "a": 2, "e": "An element (Zn) replaces another element (H) in a compound (HW Ch7 Q8)."},
    {"t": "mc", "q": "AgNO<sub>3</sub>(aq) + NaCl(aq) &rarr; AgCl(s) + NaNO<sub>3</sub>(aq) is a", "c": ["single replacement", "double replacement (precipitation)", "combination", "decomposition"], "a": 1, "e": "The cations swap partners; solid AgCl forms."},
    {"t": "mc", "q": "CH<sub>4</sub> + 2 O<sub>2</sub> &rarr; CO<sub>2</sub> + 2 H<sub>2</sub>O is a", "c": ["combustion", "combination", "decomposition", "double replacement"], "a": 0, "e": "Fuel + O<sub>2</sub> &rarr; CO<sub>2</sub> + H<sub>2</sub>O is combustion (HW Ch7 Q4)."},
    {"t": "mc", "q": "3 KOH + H<sub>3</sub>PO<sub>4</sub> &rarr; K<sub>3</sub>PO<sub>4</sub> + 3 H<sub>2</sub>O is a", "c": ["acid&ndash;base neutralization", "combination", "single replacement", "decomposition"], "a": 0, "e": "Base + acid &rarr; salt + water (Quiz Ch7 Q6)."},
    {"t": "mc", "q": "Which reaction is NOT a double replacement?", "c": ["BaCl<sub>2</sub> + K<sub>2</sub>SO<sub>4</sub> &rarr; BaSO<sub>4</sub> + 2 KCl", "2 Mg + O<sub>2</sub> &rarr; 2 MgO", "Pb(NO<sub>3</sub>)<sub>2</sub> + 2 KI &rarr; PbI<sub>2</sub> + 2 KNO<sub>3</sub>", "HCl + NaOH &rarr; NaCl + H<sub>2</sub>O"], "a": 1, "e": "2 Mg + O<sub>2</sub> &rarr; 2 MgO joins two substances: combination."},
    {"t": "mc", "q": "CaCO<sub>3</sub> &rarr; CaO + CO<sub>2</sub> is a", "c": ["combination", "decomposition", "single replacement", "combustion"], "a": 1, "e": "One reactant, two products."},
    {"t": "mc", "q": "Cu + 2 AgNO<sub>3</sub> &rarr; Cu(NO<sub>3</sub>)<sub>2</sub> + 2 Ag is a", "c": ["single replacement", "double replacement", "combination", "decomposition"], "a": 0, "e": "Element Cu replaces Ag in the compound."},
    {"t": "mc", "q": "Burning a hydrocarbon in oxygen produces", "c": ["CO<sub>2</sub> and H<sub>2</sub>O", "C and H<sub>2</sub>", "CO<sub>2</sub> and H<sub>2</sub>", "CH<sub>4</sub> and O<sub>2</sub>"], "a": 0, "e": "In the complete combustion this course uses, a hydrocarbon burns to CO<sub>2</sub> and H<sub>2</sub>O."},
    {"t": "mc", "q": "Which equation shows a physical change, not a chemical reaction?", "c": ["H<sub>2</sub>O(s) &rarr; H<sub>2</sub>O(l)", "2 H<sub>2</sub>O(l) &rarr; 2 H<sub>2</sub>(g) + O<sub>2</sub>(g)", "CH<sub>3</sub>OH + O<sub>2</sub> &rarr; CO<sub>2</sub> + H<sub>2</sub>O", "Mg + 2 HCl &rarr; MgCl<sub>2</sub> + H<sub>2</sub>"], "a": 0, "e": "Melting ice changes the state only; it is still H<sub>2</sub>O (Quiz Ch7 Q3)."},
    {"t": "mc", "q": "The pattern AB + CD &rarr; AD + CB is", "c": ["combination", "decomposition", "single replacement", "double replacement"], "a": 3, "e": "Both compounds swap partners: double replacement (precipitation, neutralization and gas-evolving reactions are all this kind)."}
  ]
},
{
  "id": "ch7-c", "chapter": "Chapter 7", "title": "Precipitation, acid&ndash;base and gas-evolving reactions", "minutes": 12,
  "src": ["Ch7 - Classifying Chemical Reactions (page)", "Homework + Quiz - Chapter 7", "Chapter 8 - Stoichiometry worksheet Q3, Q9"],
  "qs": [
    {"t": "mc", "q": "A precipitation reaction happens when", "c": ["two aqueous ionic compounds form a new compound that does not dissolve", "a gas forms", "a metal replaces another metal", "a fuel burns in oxygen"], "a": 0, "e": "The solid that forms is the precipitate (HW Ch7 Q5)."},
    {"t": "mc", "q": "Aqueous potassium iodide is mixed with aqueous lead(II) nitrate. What happens?", "c": ["No reaction; everything stays dissolved", "Both products are precipitates", "Lead(II) iodide precipitates", "Potassium nitrate precipitates"], "a": 2, "e": "2 KI + Pb(NO<sub>3</sub>)<sub>2</sub> &rarr; PbI<sub>2</sub>(s) + 2 KNO<sub>3</sub>(aq) (HW Ch7 Q10)."},
    {"t": "mc", "q": "BaCl<sub>2</sub>(aq) + 2 AgNO<sub>3</sub>(aq) &rarr; 2 AgCl + Ba(NO<sub>3</sub>)<sub>2</sub>. Which product is the solid?", "c": ["AgCl", "Ba(NO<sub>3</sub>)<sub>2</sub>", "Both", "Neither"], "a": 0, "e": "Silver chloride precipitates (worksheet Q3)."},
    {"t": "mc", "q": "True or false: lead(II) carbonate dissolves easily in water.", "c": ["True", "False"], "a": 1, "e": "False. PbCO<sub>3</sub> does not dissolve in water (HW Ch7 Q6)."},
    {"t": "mc", "q": "What are the products when aluminum metal reacts with sulfuric acid? (Al is more reactive than hydrogen.)", "c": ["Aluminum sulfate and hydrogen gas", "Aluminum and sulfur dioxide", "Aluminum hydroxide and sulfur", "No reaction"], "a": 0, "e": "2 Al + 3 H<sub>2</sub>SO<sub>4</sub> &rarr; Al<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub> + 3 H<sub>2</sub> (Quiz Ch7 Q2; practice exam)."},
    {"t": "mc", "q": "HCl(aq) + NaOH(aq) &rarr; ?", "c": ["NaCl(aq) + H<sub>2</sub>O(l)", "NaH + HClO", "NaCl + H<sub>2</sub>", "No reaction"], "a": 0, "e": "Acid + base &rarr; salt + water."},
    {"t": "mc", "q": "An acid&ndash;base neutralization always produces water and", "c": ["a gas", "a salt (ionic compound)", "a pure metal", "another acid"], "a": 1, "e": "The cation of the base and the anion of the acid form a salt, e.g. K<sub>3</sub>PO<sub>4</sub>."},
    {"t": "mc", "q": "CaCO<sub>3</sub>(s) + 2 HCl(aq) &rarr; CaCl<sub>2</sub>(aq) + CO<sub>2</sub>(g) + H<sub>2</sub>O(l) is best described as", "c": ["a gas-evolving reaction", "a combination", "a combustion", "a decomposition"], "a": 0, "e": "A double replacement that releases CO<sub>2</sub> gas (worksheet Q9)."},
    {"t": "mc", "q": "Which observation points to a chemical reaction?", "c": ["A solid forms when two clear solutions are mixed", "Ice melts", "Water evaporates", "Sugar is ground into powder"], "a": 0, "e": "A precipitate forming means new substances were made. The others are physical changes."},
    {"t": "mc", "q": "True or false: solid copper placed in aluminum bromide solution produces aluminum metal and copper(II) bromide. (Cu is less reactive than Al.)", "c": ["True", "False"], "a": 1, "e": "False: no reaction, because the less reactive Cu cannot replace Al (Quiz Ch7 Q10). You do not need to memorize the activity series."},
    {"t": "mc", "q": "True or false: 2 K<sub>2</sub>S<sub>2</sub>O<sub>3</sub>(aq) + I<sub>2</sub>(aq) &rarr; K<sub>2</sub>S<sub>4</sub>O<sub>6</sub>(aq) + 2 KI(aq) is a precipitation reaction.", "c": ["True", "False"], "a": 1, "e": "False. Every product is (aq); no solid forms (Quiz Ch7 Q9)."},
    {"t": "mc", "q": "Which state symbol marks a precipitate?", "c": ["(aq)", "(s)", "(g)", "(l)"], "a": 1, "e": "A precipitate is a solid: (s)."}
  ]
},
{
  "id": "ch8-a", "chapter": "Chapter 8", "title": "Mole ratios and mole-to-mass", "minutes": 12,
  "src": ["Ch8 - Mole-to-Mole and Mole-to-Mass pages", "Chapter 8 - Stoichiometry worksheet Q1, Q5, Q7", "Ch8 - Module 8 Overview"],
  "qs": [
    {"t": "mc", "q": "In N<sub>2</sub> + 3 H<sub>2</sub> &rarr; 2 NH<sub>3</sub>, the mole ratio of H<sub>2</sub> to NH<sub>3</sub> is", "c": ["1 : 2", "3 : 2", "2 : 3", "3 : 1"], "a": 1, "e": "Read the coefficients: 3 mol H<sub>2</sub> : 2 mol NH<sub>3</sub>."},
    {"t": "num", "q": "N<sub>2</sub> + 3 H<sub>2</sub> &rarr; 2 NH<sub>3</sub>. How many moles of NH<sub>3</sub> form from 2.50 mol N<sub>2</sub>?", "a": 5.00, "tol": 0.01, "unit": "mol", "calc": "2.50*2/1", "e": "2.50 mol N<sub>2</sub> &times; (2 mol NH<sub>3</sub> / 1 mol N<sub>2</sub>) = 5.00 mol."},
    {"t": "num", "q": "4 NH<sub>3</sub> + 7 O<sub>2</sub> &rarr; 4 NO<sub>2</sub> + 6 H<sub>2</sub>O. How many moles of O<sub>2</sub> react with 3.20 mol NH<sub>3</sub>?", "a": 5.60, "tol": 0.01, "unit": "mol", "calc": "3.20*7/4", "e": "3.20 &times; 7/4 = 5.60 mol O<sub>2</sub>."},
    {"t": "num", "q": "Same reaction: how many moles of H<sub>2</sub>O form from 2.00 mol NH<sub>3</sub>?", "a": 3.00, "tol": 0.01, "unit": "mol", "calc": "2.00*6/4", "e": "2.00 &times; 6/4 = 3.00 mol H<sub>2</sub>O."},
    {"t": "num", "q": "What is the molar mass of H<sub>2</sub>O? (H 1.008, O 16.00)", "a": 18.02, "tol": 0.002, "unit": "g/mol", "calc": "mm('H2O')", "e": "2(1.008) + 16.00 = 18.02 g/mol."},
    {"t": "num", "q": "What is the molar mass of CaCO<sub>3</sub>? (Ca 40.08, C 12.01, O 16.00)", "a": 100.09, "tol": 0.002, "unit": "g/mol", "calc": "mm('CaCO3')", "e": "40.08 + 12.01 + 3(16.00) = 100.09 g/mol."},
    {"t": "num", "q": "CH<sub>4</sub> + 2 O<sub>2</sub> &rarr; CO<sub>2</sub> + 2 H<sub>2</sub>O. How many grams of water form from 0.500 mol CH<sub>4</sub>? (H<sub>2</sub>O 18.02 g/mol)", "a": 18.0, "tol": 0.01, "unit": "g", "calc": "0.500*2*mm('H2O')", "e": "0.500 mol CH<sub>4</sub> &times; 2 = 1.00 mol H<sub>2</sub>O &times; 18.02 g/mol = 18.0 g."},
    {"t": "num", "q": "Same reaction: how many grams of CO<sub>2</sub> form from 0.750 mol CH<sub>4</sub>? (CO<sub>2</sub> 44.01 g/mol)", "a": 33.0, "tol": 0.01, "unit": "g", "calc": "0.750*mm('CO2')", "e": "0.750 mol CH<sub>4</sub> &rarr; 0.750 mol CO<sub>2</sub> &times; 44.01 = 33.0 g."},
    {"t": "num", "q": "2 Sb + 3 Cl<sub>2</sub> &rarr; 2 SbCl<sub>3</sub>. How many moles of Cl<sub>2</sub> make 0.0400 mol SbCl<sub>3</sub>?", "a": 0.0600, "tol": 0.01, "unit": "mol", "calc": "0.0400*3/2", "e": "0.0400 &times; 3/2 = 0.0600 mol Cl<sub>2</sub>."},
    {"t": "num", "q": "How many moles are in 36.0 g of H<sub>2</sub>O? (18.02 g/mol)", "a": 2.00, "tol": 0.01, "unit": "mol", "calc": "36.0/mm('H2O')", "e": "36.0 g &divide; 18.02 g/mol = 2.00 mol."},
    {"t": "num", "q": "How many grams are in 0.250 mol NaCl? (Na 22.99, Cl 35.45)", "a": 14.6, "tol": 0.01, "unit": "g", "calc": "0.250*mm('NaCl')", "e": "Molar mass 58.44 g/mol &times; 0.250 mol = 14.6 g."},
    {"t": "mc", "q": "Which path converts grams of A into grams of B?", "c": ["g A &rarr; mol A &rarr; mol B &rarr; g B", "g A &rarr; g B directly, using the coefficients", "mol A &rarr; g A &rarr; g B", "g A &rarr; mol B &rarr; mol A &rarr; g B"], "a": 0, "e": "The mole ratio only works on moles, so go through moles of A and moles of B."}
  ]
},
{
  "id": "ch8-b", "chapter": "Chapter 8", "title": "Mass-to-mass and Avogadro's number", "minutes": 14,
  "src": ["Ch8 - Mole-to-Mass and Mass-to-Mass Conversions (page)", "Chapter 8 - Stoichiometry worksheet Q2, Q3, Q6, Q7", "Study guide for Exam II (Avogadro's #)"],
  "qs": [
    {"t": "num", "q": "CaCN<sub>2</sub> + 3 H<sub>2</sub>O &rarr; CaCO<sub>3</sub> + 2 NH<sub>3</sub>. How many kilograms of NH<sub>3</sub> form from 10.0 kg CaCN<sub>2</sub>? (CaCN<sub>2</sub> 80.11, NH<sub>3</sub> 17.03 g/mol)", "a": 4.25, "tol": 0.01, "unit": "kg", "calc": "10.0/mm('CaCN2')*2*mm('NH3')", "e": "10.0 kg &divide; 80.11 = 0.1248 kmol &times; 2 = 0.2497 kmol NH<sub>3</sub> &times; 17.03 = 4.25 kg."},
    {"t": "num", "q": "2 Mg + O<sub>2</sub> &rarr; 2 MgO. How many grams of MgO form from 4.86 g Mg? (Mg 24.31, MgO 40.31 g/mol)", "a": 8.06, "tol": 0.01, "unit": "g", "calc": "4.86/24.31*2/2*mm('MgO')", "e": "4.86 &divide; 24.31 = 0.200 mol Mg &rarr; 0.200 mol MgO &times; 40.31 = 8.06 g."},
    {"t": "num", "q": "C<sub>3</sub>H<sub>8</sub> + 5 O<sub>2</sub> &rarr; 3 CO<sub>2</sub> + 4 H<sub>2</sub>O. How many grams of CO<sub>2</sub> form from 4.41 g C<sub>3</sub>H<sub>8</sub>? (C<sub>3</sub>H<sub>8</sub> 44.09, CO<sub>2</sub> 44.01 g/mol)", "a": 13.2, "tol": 0.01, "unit": "g", "calc": "4.41/mm('C3H8')*3*mm('CO2')", "e": "4.41 &divide; 44.09 = 0.100 mol &times; 3 = 0.300 mol CO<sub>2</sub> &times; 44.01 = 13.2 g."},
    {"t": "num", "q": "Same reaction: how many grams of O<sub>2</sub> burn 4.41 g C<sub>3</sub>H<sub>8</sub>? (O<sub>2</sub> 32.00 g/mol)", "a": 16.0, "tol": 0.01, "unit": "g", "calc": "4.41/mm('C3H8')*5*mm('O2')", "e": "0.100 mol C<sub>3</sub>H<sub>8</sub> &times; 5 = 0.500 mol O<sub>2</sub> &times; 32.00 = 16.0 g."},
    {"t": "num", "q": "How many molecules are in 2.00 mol CO<sub>2</sub>? (Avogadro's number 6.022 &times; 10<sup>23</sup>)", "a": 1.204e24, "tol": 0.01, "unit": "molecules", "calc": "2.00*NA", "e": "2.00 &times; 6.022 &times; 10<sup>23</sup> = 1.20 &times; 10<sup>24</sup> molecules."},
    {"t": "num", "q": "4 NH<sub>3</sub> + 7 O<sub>2</sub> &rarr; 4 NO<sub>2</sub> + 6 H<sub>2</sub>O. How many molecules of NO<sub>2</sub> form when 2.00 mol NH<sub>3</sub> react?", "a": 1.204e24, "tol": 0.01, "unit": "molecules", "calc": "2.00*4/4*NA", "e": "2.00 mol NH<sub>3</sub> &rarr; 2.00 mol NO<sub>2</sub> &times; 6.022 &times; 10<sup>23</sup> = 1.20 &times; 10<sup>24</sup> (worksheet Q7 method)."},
    {"t": "num", "q": "C<sub>3</sub>H<sub>8</sub> + 5 O<sub>2</sub> &rarr; 3 CO<sub>2</sub> + 4 H<sub>2</sub>O. How many molecules of CO<sub>2</sub> form from 4.41 g propane? (44.09 g/mol)", "a": 1.807e23, "tol": 0.01, "unit": "molecules", "calc": "4.41/mm('C3H8')*3*NA", "e": "0.100 mol &times; 3 = 0.300 mol CO<sub>2</sub> &times; 6.022 &times; 10<sup>23</sup> = 1.81 &times; 10<sup>23</sup> (worksheet Q6 method)."},
    {"t": "num", "q": "BaCl<sub>2</sub> + 2 AgNO<sub>3</sub> &rarr; 2 AgCl + Ba(NO<sub>3</sub>)<sub>2</sub>. What mass of BaCl<sub>2</sub> must react to form 1.00 g AgCl? (AgCl 143.32, BaCl<sub>2</sub> 208.23 g/mol)", "a": 0.727, "tol": 0.01, "unit": "g", "calc": "1.00/mm('AgCl')/2*mm('BaCl2')", "e": "1.00 &divide; 143.32 = 0.00698 mol AgCl &divide; 2 = 0.00349 mol BaCl<sub>2</sub> &times; 208.23 = 0.727 g."},
    {"t": "num", "q": "How many atoms are in 0.500 mol of iron?", "a": 3.011e23, "tol": 0.01, "unit": "atoms", "calc": "0.500*NA", "e": "0.500 &times; 6.022 &times; 10<sup>23</sup> = 3.01 &times; 10<sup>23</sup> atoms."},
    {"t": "num", "q": "How many moles are 3.011 &times; 10<sup>23</sup> molecules of water?", "a": 0.500, "tol": 0.01, "unit": "mol", "calc": "3.011e23/NA", "e": "Divide by Avogadro's number: 3.011 &times; 10<sup>23</sup> &divide; 6.022 &times; 10<sup>23</sup> = 0.500 mol."},
    {"t": "mc", "q": "Avogadro's number is", "c": ["6.022 &times; 10<sup>23</sup> particles per mole", "1 gram per mole", "6.022 &times; 10<sup>&minus;23</sup> particles per mole", "the molar mass of carbon"], "a": 0, "e": "One mole of anything is 6.022 &times; 10<sup>23</sup> particles. The exam provides the value."},
    {"t": "num", "q": "N<sub>2</sub> + 3 H<sub>2</sub> &rarr; 2 NH<sub>3</sub>. How many grams of H<sub>2</sub> make 34.06 g NH<sub>3</sub>? (NH<sub>3</sub> 17.03, H<sub>2</sub> 2.016 g/mol)", "a": 6.05, "tol": 0.01, "unit": "g", "calc": "34.06/mm('NH3')*3/2*mm('H2')", "e": "34.06 &divide; 17.03 = 2.00 mol NH<sub>3</sub> &times; 3/2 = 3.00 mol H<sub>2</sub> &times; 2.016 = 6.05 g."}
  ]
},
{
  "id": "ch8-c", "chapter": "Chapter 8", "title": "Limiting reactant and percent yield", "minutes": 14,
  "src": ["Ch8 - Limiting and Excess Reactants (page)", "Ch8 - Theoretical and Percent Yield (page)", "Chapter 8 - Stoichiometry worksheet Q4, Q5, Q8, Q9, Q10", "Ch8 - Discussion - Stoichiometry"],
  "qs": [
    {"t": "mc", "q": "The limiting reactant is", "c": ["the reactant that runs out first and sets how much product forms", "the reactant with the largest mass", "the first product formed", "the reactant left over at the end"], "a": 0, "e": "Once the limiting reactant runs out, the reaction stops (Limiting and Excess Reactants page)."},
    {"t": "mc", "q": "The excess reactant is the one that", "c": ["is used up first", "is left over when the reaction stops", "always has the smaller coefficient", "sets the theoretical yield"], "a": 1, "e": "Some of it stays unused after the limiting reactant is gone."},
    {"t": "num", "q": "A reaction's theoretical yield is 8.00 g; you collect 7.20 g. What is the percent yield?", "a": 90.0, "tol": 0.005, "unit": "%", "calc": "7.20/8.00*100", "e": "Percent yield = actual &divide; theoretical &times; 100 = 7.20 &divide; 8.00 &times; 100 = 90.0%."},
    {"t": "num", "q": "You got 2.50 g of product, an 80.0% yield. What was the theoretical yield?", "a": 3.13, "tol": 0.01, "unit": "g", "calc": "2.50/0.800", "e": "Theoretical = actual &divide; 0.800 = 3.13 g (worksheet Q4 method)."},
    {"t": "num", "q": "The theoretical yield is 12.0 g and the percent yield is 75.0%. What is the actual yield?", "a": 9.00, "tol": 0.01, "unit": "g", "calc": "12.0*0.750", "e": "Actual = 0.750 &times; 12.0 g = 9.00 g."},
    {"t": "mc", "q": "N<sub>2</sub> + 3 H<sub>2</sub> &rarr; 2 NH<sub>3</sub> starts with 2.00 mol N<sub>2</sub> and 3.00 mol H<sub>2</sub>. Which is limiting?", "c": ["N<sub>2</sub>", "H<sub>2</sub>", "Neither"], "a": 1, "e": "2.00 mol N<sub>2</sub> would need 6.00 mol H<sub>2</sub>; only 3.00 mol is there, so H<sub>2</sub> runs out first."},
    {"t": "num", "q": "Same mixture: how many moles of NH<sub>3</sub> form?", "a": 2.00, "tol": 0.01, "unit": "mol", "calc": "3.00*2/3", "e": "Use the limiting reactant: 3.00 mol H<sub>2</sub> &times; 2/3 = 2.00 mol NH<sub>3</sub>."},
    {"t": "mc", "q": "2 H<sub>2</sub> + O<sub>2</sub> &rarr; 2 H<sub>2</sub>O with 4.00 g H<sub>2</sub> (2.016 g/mol) and 16.0 g O<sub>2</sub> (32.00 g/mol). Which is limiting?", "c": ["H<sub>2</sub>", "O<sub>2</sub>"], "a": 1, "e": "1.98 mol H<sub>2</sub> needs 0.992 mol O<sub>2</sub>, but only 0.500 mol O<sub>2</sub> is there."},
    {"t": "num", "q": "Same mixture: how many grams of water form? (H<sub>2</sub>O 18.02 g/mol)", "a": 18.0, "tol": 0.01, "unit": "g", "calc": "16.0/mm('O2')*2*mm('H2O')", "e": "0.500 mol O<sub>2</sub> &times; 2 = 1.00 mol H<sub>2</sub>O &times; 18.02 = 18.0 g."},
    {"t": "num", "q": "CaCO<sub>3</sub> + 2 HCl &rarr; CaCl<sub>2</sub> + CO<sub>2</sub> + H<sub>2</sub>O with 20.0 g CaCO<sub>3</sub> (100.09) and 20.0 g HCl (36.46). How many grams of CO<sub>2</sub> (44.01) form?", "a": 8.79, "tol": 0.01, "unit": "g", "calc": "20.0/mm('CaCO3')*mm('CO2')", "e": "0.200 mol CaCO<sub>3</sub> needs 0.400 mol HCl; 0.549 mol is there, so CaCO<sub>3</sub> limits: 0.200 &times; 44.01 = 8.79 g."},
    {"t": "num", "q": "Same mixture: how many grams of HCl are left over?", "a": 5.43, "tol": 0.015, "unit": "g", "calc": "20.0-20.0/mm('CaCO3')*2*mm('HCl')", "e": "HCl used = 0.3997 mol &times; 36.46 = 14.57 g; left = 20.0 &minus; 14.57 = 5.43 g (worksheet Q10 method)."},
    {"t": "num", "q": "2 P + 3 I<sub>2</sub> &rarr; 2 PI<sub>3</sub> with 3.10 g P (30.97) and 25.4 g I<sub>2</sub> (253.80). What is the theoretical yield of PI<sub>3</sub> (411.67 g/mol)?", "a": 27.5, "tol": 0.01, "unit": "g", "calc": "25.4/mm('I2')*2/3*mm('PI3')", "e": "0.100 mol P needs 0.150 mol I<sub>2</sub>; only 0.100 mol I<sub>2</sub>, so I<sub>2</sub> limits: 0.100 &times; 2/3 &times; 411.67 = 27.5 g."}
  ]
},
{
  "id": "ch9-a", "chapter": "Chapter 9", "title": "Light, energy levels and orbitals", "minutes": 12,
  "src": ["Homework - Chapter 9", "Quiz - Chapter 9", "Ch9 - Module 9 Overview"],
  "qs": [
    {"t": "mc", "q": "The distance between two neighboring wave peaks is the", "c": ["frequency", "amplitude", "wavelength", "Planck's constant"], "a": 2, "e": "Wavelength (&lambda;) is peak to peak (Quiz Ch9 Q1)."},
    {"t": "mc", "q": "The number of waves that pass a point each second is the", "c": ["frequency", "amplitude", "wavelength", "energy level"], "a": 0, "e": "Frequency (&nu;), in s<sup>&minus;1</sup> (Quiz Ch9 Q6)."},
    {"t": "mc", "q": "As wavelength increases, frequency", "c": ["increases", "decreases", "stays the same"], "a": 1, "e": "c = &lambda;&nu; with c fixed, so a longer wavelength means a lower frequency (HW Ch9 Q9: &ldquo;frequency increases as well&rdquo; is False)."},
    {"t": "num", "q": "What is the wavelength, in meters, of light with frequency 6.00 &times; 10<sup>14</sup> s<sup>&minus;1</sup>? (c = 3.00 &times; 10<sup>8</sup> m/s)", "a": 5.00e-7, "tol": 0.01, "unit": "m", "calc": "3.00e8/6.00e14", "e": "&lambda; = c &divide; &nu; = 3.00 &times; 10<sup>8</sup> &divide; 6.00 &times; 10<sup>14</sup> = 5.00 &times; 10<sup>&minus;7</sup> m."},
    {"t": "num", "q": "What is the frequency of light with wavelength 500. nm? (c = 3.00 &times; 10<sup>8</sup> m/s; 1 nm = 10<sup>&minus;9</sup> m)", "a": 6.00e14, "tol": 0.01, "unit": "s&#8315;&sup1;", "calc": "3.00e8/500e-9", "e": "500 nm = 5.00 &times; 10<sup>&minus;7</sup> m; &nu; = c &divide; &lambda; = 6.00 &times; 10<sup>14</sup> s<sup>&minus;1</sup>. Convert nm to m first."},
    {"t": "mc", "q": "The lowest possible energy state of an electron is the", "c": ["low state", "ground state", "basic state", "excited state"], "a": 1, "e": "Ground state = lowest energy; higher states are excited states (HW Ch9 Q7)."},
    {"t": "mc", "q": "What is the most electrons a p sublevel can hold?", "c": ["2", "6", "10", "14"], "a": 1, "e": "p has 3 orbitals &times; 2 electrons = 6."},
    {"t": "mc", "q": "How many orbitals does a d sublevel have?", "c": ["1", "3", "5", "7"], "a": 2, "e": "s 1, p 3, d 5, f 7 orbitals. So d holds 10 electrons."},
    {"t": "mc", "q": "One orbital can hold", "c": ["2 electrons with opposite spins", "2 electrons with the same spin", "4 electrons", "6 electrons"], "a": 0, "e": "Each orbital holds at most 2 electrons, with opposite spins (Pauli principle; Quiz Ch9 Q3)."},
    {"t": "mc", "q": "What is the most electrons the second principal energy level (n = 2) can hold?", "c": ["2", "4", "6", "8"], "a": 3, "e": "2s (2) + 2p (6) = 8 (Quiz Ch9 Q5)."},
    {"t": "mc", "q": "What is the most electrons the third principal energy level (n = 3) can hold?", "c": ["8", "10", "14", "18"], "a": 3, "e": "3s (2) + 3p (6) + 3d (10) = 18 (Quiz Ch9 Q7)."},
    {"t": "mc", "q": "What is the most electrons the 4f sublevel can hold?", "c": ["2", "6", "10", "14"], "a": 3, "e": "f has 7 orbitals &times; 2 = 14 (Quiz Ch9 Q8)."}
  ]
},
{
  "id": "ch9-b", "chapter": "Chapter 9", "title": "Writing electron configurations", "minutes": 14,
  "src": ["Homework - Chapter 9", "Quiz - Chapter 9", "Ch9 - Discussion - Electron Configurations", "Practice Problem for Midterm 2 (Q12 configurations)"],
  "qs": [
    {"t": "mc", "q": "Which is the electron configuration of oxygen (8 electrons)?", "c": ["1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>4</sup>", "1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup>", "1s<sup>2</sup> 2p<sup>6</sup>", "1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>2</sup>"], "a": 0, "e": "2 + 2 + 4 = 8 electrons (discussion: O)."},
    {"t": "mc", "q": "Which element has 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>4</sup>?", "c": ["O", "S", "Ar", "Si"], "a": 1, "e": "Add the superscripts: 16 electrons = sulfur."},
    {"t": "mc", "q": "Which element has 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>1</sup>?", "c": ["Na", "Mg", "Ne", "K"], "a": 0, "e": "11 electrons = sodium (discussion: Na)."},
    {"t": "text", "norm": "cfg", "q": "Write the full electron configuration of magnesium (12 electrons). Type it like 1s2 2s2 ...", "a": ["1s22s22p63s2"], "e": "1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup>: 2 + 2 + 6 + 2 = 12."},
    {"t": "text", "norm": "cfg", "q": "Write the full electron configuration of chlorine (17 electrons).", "a": ["1s22s22p63s23p5"], "e": "1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>5</sup> (practice exam MC: Cl)."},
    {"t": "mc", "q": "Which is the electron configuration of iron (26 electrons)?", "c": ["1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>3s<sup>2</sup>3p<sup>6</sup>4s<sup>2</sup>3p<sup>6</sup>", "1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>3s<sup>2</sup>3p<sup>6</sup>4s<sup>2</sup>3d<sup>6</sup>", "1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>3s<sup>2</sup>3p<sup>6</sup>4s<sup>2</sup>4p<sup>6</sup>", "1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>3s<sup>2</sup>3p<sup>6</sup>4s<sup>2</sup>"], "a": 1, "e": "After 4s comes 3d: 18 + 2 + 6 = 26 (Quiz Ch9 Q14)."},
    {"t": "mc", "q": "Which is the abbreviated (noble-gas) configuration of krypton (36 electrons)?", "c": ["[Ar] 4s<sup>2</sup> 3d<sup>10</sup> 4p<sup>6</sup>", "[Ar] 1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>3s<sup>2</sup>3p<sup>6</sup>4s<sup>2</sup>3d<sup>10</sup>4p<sup>6</sup>", "[Kr] 4s<sup>2</sup> 3d<sup>10</sup> 4p<sup>6</sup>", "[Ne] 3s<sup>2</sup> 3p<sup>6</sup>"], "a": 0, "e": "[Ar] stands for the first 18 electrons, so only 4s<sup>2</sup> 3d<sup>10</sup> 4p<sup>6</sup> follows. The practice key's answer repeats the core; that is an error."},
    {"t": "mc", "q": "The configuration of a bromine atom (35 electrons) ends in", "c": ["4p<sup>5</sup>", "4p<sup>6</sup>", "3d<sup>10</sup> 4s<sup>2</sup>", "4s<sup>1</sup>"], "a": 0, "e": "1s<sup>2</sup>2s<sup>2</sup>2p<sup>6</sup>3s<sup>2</sup>3p<sup>6</sup>4s<sup>2</sup>3d<sup>10</sup>4p<sup>5</sup> (HW Ch9 Q10; practice key)."},
    {"t": "mc", "q": "Which is the electron configuration of the bromide ion, Br<sup>&minus;</sup>?", "c": ["[Ar] 4s<sup>2</sup> 3d<sup>10</sup> 4p<sup>6</sup>", "[Ar] 4s<sup>2</sup> 3d<sup>10</sup> 4p<sup>5</sup>", "[Ar] 4s<sup>2</sup> 3d<sup>10</sup> 4p<sup>4</sup>", "[Ar] 4s<sup>2</sup> 3d<sup>10</sup>"], "a": 0, "e": "Br<sup>&minus;</sup> has one extra electron: 36, so 4p<sup>6</sup> (practice key)."},
    {"t": "mc", "q": "Which species have the configuration 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>6</sup>?", "c": ["Ca<sup>2+</sup> only", "K<sup>+</sup> only", "Cl<sup>&minus;</sup> only", "All of Ca<sup>2+</sup>, K<sup>+</sup> and Cl<sup>&minus;</sup>"], "a": 3, "e": "Each has 18 electrons: Ca 20 &minus; 2, K 19 &minus; 1, Cl 17 + 1 (practice exam MC)."},
    {"t": "text", "norm": "cfg", "q": "Write the abbreviated configuration of potassium (19 electrons). Type the core as [Ar].", "a": ["[ar]4s1"], "e": "[Ar] covers 18 electrons; the 19th goes into 4s: [Ar] 4s<sup>1</sup>."},
    {"t": "mc", "q": "Which element has 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>3</sup>?", "c": ["Nitrogen", "Sulfur", "Argon", "Phosphorus"], "a": 3, "e": "15 electrons = phosphorus (Quiz Ch9 Q9)."}
  ]
},
{
  "id": "ch9-c", "chapter": "Chapter 9", "title": "Valence electrons and blocks", "minutes": 12,
  "src": ["Homework - Chapter 9", "Quiz - Chapter 9", "Practice Problem for Midterm 2"],
  "qs": [
    {"t": "mc", "q": "Elements in the same group (column) have the same number of", "c": ["valence electrons", "protons", "principal energy levels", "electrons"], "a": 0, "e": "A group shares its valence-electron count (HW Ch9 Q2)."},
    {"t": "mc", "q": "Elements in the same period (row) have the same number of", "c": ["valence electrons", "protons", "principal energy levels", "neutrons"], "a": 2, "e": "Period 3 elements all fill up to n = 3 (HW Ch9 Q1)."},
    {"t": "mc", "q": "How many valence electrons does magnesium have?", "c": ["1", "2", "3", "12"], "a": 1, "e": "Mg is Group 2A: 3s<sup>2</sup>, so 2."},
    {"t": "mc", "q": "How many valence electrons does sulfur have?", "c": ["16", "32", "6", "2"], "a": 2, "e": "S is Group 6A: 3s<sup>2</sup> 3p<sup>4</sup> = 6 (practice exam MC)."},
    {"t": "mc", "q": "How many valence electrons are in 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>5</sup>?", "c": ["2", "5", "7", "9"], "a": 2, "e": "Outer level n = 2: 2 + 5 = 7 (fluorine)."},
    {"t": "mc", "q": "The alkali metals have how many valence electrons?", "c": ["1", "2", "3", "8"], "a": 0, "e": "Group 1A: one s electron."},
    {"t": "mc", "q": "Most noble gases have how many valence electrons?", "c": ["0", "2", "6", "8"], "a": 3, "e": "A full s<sup>2</sup>p<sup>6</sup> outer level = 8 (HW Ch9 Q6)."},
    {"t": "mc", "q": "An element with configuration [Ar] 4s<sup>2</sup> 3d<sup>8</sup> is in the", "c": ["s block", "p block", "d block", "f block"], "a": 2, "e": "The last electrons go into d (HW Ch9 Q3)."},
    {"t": "mc", "q": "An element ending in 3s<sup>2</sup> 3p<sup>2</sup> is in the", "c": ["s block", "p block", "d block", "f block"], "a": 1, "e": "The last electrons go into p."},
    {"t": "mc", "q": "An element ending in 4s<sup>1</sup> is in the", "c": ["s block", "p block", "d block", "f block"], "a": 0, "e": "The last electron goes into s (potassium)."},
    {"t": "num", "q": "How many electrons are in the third principal energy level of a ground-state chlorine atom?", "a": 7, "tol": 0, "unit": "electrons", "calc": "2+5", "e": "Cl: ... 3s<sup>2</sup> 3p<sup>5</sup>, so n = 3 holds 2 + 5 = 7 (Quiz Ch9 Q10)."},
    {"t": "num", "q": "How many electrons are in the second principal energy level of a ground-state magnesium atom?", "a": 8, "tol": 0, "unit": "electrons", "calc": "2+6", "e": "Mg: 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup>, so n = 2 holds 2 + 6 = 8."},
    {"t": "mc", "q": "How many valence electrons does aluminum have?", "c": ["1", "3", "10", "13"], "a": 1, "e": "Al is Group 3A: 3s<sup>2</sup> 3p<sup>1</sup> = 3 (Quiz Ch9 Q12)."}
  ]
},
{
  "id": "mock-1", "chapter": "Mock exam", "title": "Mock Exam 1", "minutes": 25,
  "src": ["Practice Problem for Midterm 2 with the Key (structure and weighting)", "Study guide for Exam II", "All chapter files above"],
  "qs": [
    {"t": "mc", "q": "Ag is the symbol for", "c": ["gold", "silver", "argon", "aluminum"], "a": 1, "e": "Ag = silver; Au = gold; Ar = argon; Al = aluminum."},
    {"t": "num", "q": "How many neutrons are in <sup>65</sup><sub>29</sub>Cu?", "a": 36, "tol": 0, "unit": "neutrons", "calc": "65-29", "e": "65 &minus; 29 = 36."},
    {"t": "text", "norm": "name", "q": "Name Fe<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub>.", "a": ["iron(III) sulfate", "ferric sulfate"], "e": "3 SO<sub>4</sub><sup>2&minus;</sup> = &minus;6 shared by 2 Fe, so each Fe is 3+: iron(III) sulfate."},
    {"t": "text", "norm": "name", "q": "Name N<sub>2</sub>O<sub>4</sub>.", "a": ["dinitrogen tetroxide", "dinitrogen tetraoxide"], "e": "Two nonmetals: di + tetra; the a drops before oxide."},
    {"t": "text", "norm": "formula", "q": "Write the formula for lead(IV) oxide.", "a": ["PbO2"], "e": "Pb<sup>4+</sup> and O<sup>2&minus;</sup>: 1(+4) + 2(&minus;2) = 0, so PbO<sub>2</sub>."},
    {"t": "text", "norm": "formula", "q": "Write the formula for calcium nitrate.", "a": ["Ca(NO3)2"], "e": "Ca<sup>2+</sup> needs two NO<sub>3</sub><sup>&minus;</sup>: Ca(NO<sub>3</sub>)<sub>2</sub>."},
    {"t": "mc", "q": "H<sub>3</sub>PO<sub>4</sub> is named", "c": ["phosphoric acid", "phosphorous acid", "hydrophosphoric acid", "trihydrogen phosphide"], "a": 0, "e": "From phosphate (-ate), so -ic acid."},
    {"t": "mc", "q": "Which pair lists an ionic compound first and a covalent compound second?", "c": ["MgCl<sub>2</sub>, CO", "CO, MgCl<sub>2</sub>", "N<sub>2</sub>O<sub>5</sub>, SO<sub>2</sub>", "NaCl, KBr"], "a": 0, "e": "MgCl<sub>2</sub> = metal + nonmetal (ionic); CO = two nonmetals (covalent)."},
    {"t": "coef", "q": "Balance: __ N<sub>2</sub>H<sub>4</sub> + __ H<sub>2</sub>O<sub>2</sub> &rarr; __ N<sub>2</sub> + __ H<sub>2</sub>O", "a": [1, 2, 1, 4], "e": "H: 4 + 2(2) = 8 = 4 H<sub>2</sub>O; O: 2(2) = 4. Lowest whole numbers: 1, 2, 1, 4."},
    {"t": "coef", "q": "Balance: __ Na<sub>3</sub>PO<sub>4</sub> + __ MgCl<sub>2</sub> &rarr; __ NaCl + __ Mg<sub>3</sub>(PO<sub>4</sub>)<sub>2</sub>", "a": [2, 3, 6, 1], "e": "Balance PO<sub>4</sub> as a unit: 2 Na<sub>3</sub>PO<sub>4</sub> &rarr; 6 Na &rarr; 6 NaCl &rarr; 3 MgCl<sub>2</sub>."},
    {"t": "mc", "q": "2 KClO<sub>3</sub> &rarr; 2 KCl + 3 O<sub>2</sub> is a", "c": ["combination", "decomposition", "single replacement", "double replacement"], "a": 1, "e": "One compound breaks apart."},
    {"t": "text", "norm": "cfg", "q": "Write the full electron configuration of silicon (14 electrons).", "a": ["1s22s22p63s23p2"], "e": "1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>2</sup>."},
    {"t": "mc", "q": "The abbreviated configuration of calcium (20 electrons) is", "c": ["[Ar] 4s<sup>2</sup>", "[Ne] 4s<sup>2</sup>", "[Ar] 3d<sup>2</sup>", "[Kr] 4s<sup>2</sup>"], "a": 0, "e": "[Ar] = 18 electrons, plus 4s<sup>2</sup>."},
    {"t": "num", "q": "C<sub>3</sub>H<sub>8</sub> + 5 O<sub>2</sub> &rarr; 3 CO<sub>2</sub> + 4 H<sub>2</sub>O. How many grams of water form from 0.150 mol C<sub>3</sub>H<sub>8</sub>? (H<sub>2</sub>O 18.02 g/mol)", "a": 10.8, "tol": 0.01, "unit": "g", "calc": "0.150*4*mm('H2O')", "e": "0.150 &times; 4 = 0.600 mol H<sub>2</sub>O &times; 18.02 = 10.8 g."},
    {"t": "num", "q": "A reaction gives 1.376 g of product; the theoretical yield is 1.753 g. What is the percent yield?", "a": 78.5, "tol": 0.005, "unit": "%", "calc": "1.376/1.753*100", "e": "1.376 &divide; 1.753 &times; 100 = 78.5% (worksheet Q4 in reverse)."}
  ]
},
{
  "id": "mock-2", "chapter": "Mock exam", "title": "Mock Exam 2", "minutes": 25,
  "src": ["Practice Problem for Midterm 2 with the Key (structure and weighting)", "Study guide for Exam II", "Chapter 8 - Stoichiometry worksheet Q8, Q10"],
  "qs": [
    {"t": "mc", "q": "The smallest particle of an element that keeps the element's properties is a(n)", "c": ["electron", "neutron", "proton", "atom", "molecule"], "a": 3, "e": "An atom (practice exam MC)."},
    {"t": "mc", "q": "How many electrons are in the sulfide ion, S<sup>2&minus;</sup>? (S: Z = 16)", "c": ["14", "16", "18", "32"], "a": 2, "e": "16 + 2 = 18."},
    {"t": "text", "norm": "name", "q": "Name Co(NO<sub>2</sub>)<sub>2</sub>.", "a": ["cobalt(II) nitrite"], "e": "2 NO<sub>2</sub><sup>&minus;</sup> = &minus;2, so Co<sup>2+</sup>; NO<sub>2</sub><sup>&minus;</sup> is nitrite."},
    {"t": "text", "norm": "name", "q": "Name P<sub>2</sub>O<sub>5</sub>.", "a": ["diphosphorus pentoxide", "diphosphorus pentaoxide"], "e": "Two nonmetals: di + penta + oxide (textbook 6.4)."},
    {"t": "text", "norm": "formula", "q": "Write the formula for sodium hypochlorite.", "a": ["NaClO", "NaOCl"], "e": "Na<sup>+</sup> and ClO<sup>&minus;</sup> (hypochlorite): NaClO."},
    {"t": "text", "norm": "formula", "q": "Write the formula for ammonium phosphate.", "a": ["(NH4)3PO4"], "e": "3 NH<sub>4</sub><sup>+</sup> balance one PO<sub>4</sub><sup>3&minus;</sup> (textbook 6.3)."},
    {"t": "mc", "q": "HBr(aq) is named", "c": ["bromic acid", "hydrobromic acid", "hydrogen bromate", "bromous acid"], "a": 1, "e": "Binary acid: hydro + brom + -ic acid."},
    {"t": "mc", "q": "The correct formula for the compound of Al and S is", "c": ["AlS", "Al<sub>2</sub>S<sub>3</sub>", "Al<sub>3</sub>S<sub>2</sub>", "AlS<sub>3</sub>"], "a": 1, "e": "Al<sup>3+</sup> and S<sup>2&minus;</sup>: 2(+3) + 3(&minus;2) = 0."},
    {"t": "coef", "q": "Balance: __ Al + __ HCl &rarr; __ AlCl<sub>3</sub> + __ H<sub>2</sub>", "a": [2, 6, 2, 3], "e": "6 Cl needs 2 AlCl<sub>3</sub>; 6 H = 3 H<sub>2</sub>."},
    {"t": "coef", "q": "Balance: __ C<sub>2</sub>H<sub>6</sub> + __ O<sub>2</sub> &rarr; __ CO<sub>2</sub> + __ H<sub>2</sub>O", "a": [2, 7, 4, 6], "e": "1 C<sub>2</sub>H<sub>6</sub> needs 7/2 O<sub>2</sub>; doubling gives 2, 7, 4, 6 (HW Ch7 Q3: O<sub>2</sub> coefficient 7)."},
    {"t": "mc", "q": "Which is a single replacement reaction?", "c": ["Fe + CuSO<sub>4</sub> &rarr; FeSO<sub>4</sub> + Cu", "2 H<sub>2</sub>O &rarr; 2 H<sub>2</sub> + O<sub>2</sub>", "AgNO<sub>3</sub> + NaCl &rarr; AgCl + NaNO<sub>3</sub>", "2 Mg + O<sub>2</sub> &rarr; 2 MgO"], "a": 0, "e": "Element Fe takes Cu's place in the compound."},
    {"t": "text", "norm": "cfg", "q": "Write the full electron configuration of the sulfide ion, S<sup>2&minus;</sup>.", "a": ["1s22s22p63s23p6", "[ne]3s23p6"], "e": "18 electrons: 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>6</sup> 3s<sup>2</sup> 3p<sup>6</sup>."},
    {"t": "mc", "q": "How many valence electrons does nitrogen have?", "c": ["3", "5", "7", "14"], "a": 1, "e": "N: 1s<sup>2</sup> 2s<sup>2</sup> 2p<sup>3</sup>; outer level 2 + 3 = 5."},
    {"t": "num", "q": "N<sub>2</sub> + 3 H<sub>2</sub> &rarr; 2 NH<sub>3</sub> with 1.40 g N<sub>2</sub> (28.02) and 0.400 g H<sub>2</sub> (2.016). How many grams of NH<sub>3</sub> (17.03) form?", "a": 1.70, "tol": 0.01, "unit": "g", "calc": "1.40/mm('N2')*2*mm('NH3')", "e": "0.0500 mol N<sub>2</sub> needs 0.150 mol H<sub>2</sub>; 0.198 mol is there, so N<sub>2</sub> limits: 0.0500 &times; 2 &times; 17.03 = 1.70 g (worksheet Q10 mixture)."},
    {"t": "num", "q": "2 P + 3 I<sub>2</sub> &rarr; 2 PI<sub>3</sub> with 6.20 g P (30.97) and 50.0 g I<sub>2</sub> (253.80). What is the theoretical yield of PI<sub>3</sub> (411.67)?", "a": 54.1, "tol": 0.01, "unit": "g", "calc": "50.0/mm('I2')*2/3*mm('PI3')", "e": "0.200 mol P needs 0.300 mol I<sub>2</sub>; only 0.197 mol, so I<sub>2</sub> limits: 0.197 &times; 2/3 &times; 411.67 = 54.1 g."}
  ]
}
];
