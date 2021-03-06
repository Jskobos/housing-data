export function * fieldsGenerator (
  types = ['bldgs', 'units', 'value'],
  suffixes = ['_reported', '']
) {
  for (const numUnits of [
    '1_unit',
    '2_units',
    '3_to_4_units',
    '5_plus_units'
  ]) {
    for (const type of types) {
      for (const suffix of suffixes) {
        yield numUnits + '_' + type + suffix
      }
    }
  }
}

export const keyMapping = {
  '1_unit_units': '1 unit',
  '2_units_units': '2 units',
  '3_to_4_units_units': '3-4 units',
  '5_plus_units_units': '5+ units',
  '1_unit_bldgs': '1 unit',
  '2_units_bldgs': '2 units',
  '3_to_4_units_bldgs': '3-4 units',
  '5_plus_units_bldgs': '5+ units',
  '1_unit_value': '1 unit',
  '2_units_value': '2 units',
  '3_to_4_units_value': '3-4 units',
  '5_plus_units_value': '5+ units'
}

export function makeBarChartSpec (fields, filterFields, width, height) {
  const plotWidth = Math.min(width * 0.95, 936)
  const continuousBandSize = plotWidth * 10 / 936

  return {
    width: plotWidth,
    height: 0.75 * plotWidth,
    autosize: {
      type: 'fit',
      contains: 'padding'
    },
    encoding: {
      x: {
        field: 'year',
        type: 'temporal',
        axis: { title: 'Year' }
      },
      y: { field: 'value', type: 'quantitative', axis: { title: 'Units permitted' } },
      color: { field: 'key', type: 'nominal', axis: { title: 'Unit count' } }
    },
    scales: [
      {
        name: 'legend_labels',
        type: 'nominal',
        domain: ['1_unit_units', '2_units_units', '3_to_4_units_units', '5_plus_units_units'],
        range: ['1 unit', '2 units', '3-4 units', '5+ units']
      }
    ],
    transform: [
      { fold: fields },
      {
        filter: {
          field: 'key',
          oneOf: filterFields
        }
      },
      {
        calculate: JSON.stringify(keyMapping) + '[datum.key] || "Error"',
        as: 'key_pretty_printed'
      }
    ],
    data: { name: 'table' }, // note: vega-lite data attribute is a plain object instead of an array
    usermeta: { embedOptions: { renderer: 'svg' } },
    layer: [
      {
        mark: {
          type: 'bar',
          tooltip: { content: 'data' }
        },
        encoding: {
          x: {
            field: 'year'
          },
          y: {
            field: 'value'
          },
          color: {
            field: 'key_pretty_printed',
            scale: {
              scheme: 'tableau10'
            }
          },
          tooltip: [
            { field: 'year', type: 'temporal', scale: { type: 'utc' }, timeUnit: 'utcyear', title: 'Year' },
            { field: '1_unit_units', title: '1 unit', format: ',' },
            { field: '2_units_units', title: '2 units', format: ',' },
            { field: '3_to_4_units_units', title: '3-4 units', format: ',' },
            { field: '5_plus_units_units', title: '5+ units', format: ',' },
            { field: 'total_units', title: 'Total units', format: ',' }
          ]
        },
        tooltip: true
      }
    ],
    config: {
      bar: {
        continuousBandSize: continuousBandSize
      }
    }
  }
}
