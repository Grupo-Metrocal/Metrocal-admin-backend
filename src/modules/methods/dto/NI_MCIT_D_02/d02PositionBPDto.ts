const valoresBP: string[] = [
  'BP - 0.5',
  'BP - 1',
  'BP - 1.5',
  'BP - 2',
  'BP - 2.5',
  'BP - 3',
  'BP - 3.5',
  'BP - 4',
  'BP - 4.5',
  'BP - 5',
  'BP - 5.5',
  'BP - 6',
  'BP - 6.5',
  'BP - 7',
  'BP - 7.5',
  'BP - 8',
  'BP - 8.5',
  'BP - 9',
  'BP - 9.5',
  'BP - 10',
  'BP - 20',
  'BP - 30',
  'BP - 40',
  'BP - 50',
  'BP - 60',
  'BP - 70',
  'BP - 80',
  'BP - 90',
  'BP - 100',
  '0',
]

const valoresNominalesNumerales: string[] = ['0', '5', '10', '15', '20', '25']

//encontrar la posicion del valor a recibir
//en el array valoresBP
//retornar la posicion
//si no se encuentra retornar -1
export function getPosition(valor: string) {
  let index = valoresBP.indexOf(valor)
  return index + 1
}

export function getPositionNominal(valor: string) {
  let index = valoresNominalesNumerales.indexOf(valor)
  return index + 2
}

export function getValor(valor: string) {
  console.log('valor', valor)
  const valores: { [key: string]: string[] } = {
    'NI-MCPD-01': ['Micrómetro', 'SCM-00039459', 'SCM'],
    'NI-MCPD-02': ['Pie de Rey', 'SCM-00039460', 'SCM'],
    'NI-MCPD-03': ['Juego de bloques', 'SCM-00039461', 'SCM'],
    'NI-MCPPT-02': ['Higro termómetro', 'SCM-00039468', 'SCM'],
    'NI-MCPPT-05': ['Higro termómetro', 'SCM-00039467', 'SCM'],
    'NI-MCPPT-06': ['Higro termómetro', 'SCM-00039471', 'SCM'],
  }
  return valores[valor]
}
