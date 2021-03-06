import { useRouter } from 'next/router'
import Head from 'next/head'
import { useStateData } from '../../lib/data_loader.js'
import SelectSearch from 'react-select-search/dist/cjs'
import { useMemo, useState } from 'react'
import { VegaLite } from 'react-vega'
import { Nav, GitHubFooter } from '../../lib/common_elements.js'
import { fieldsGenerator, makeBarChartSpec } from '../../lib/plots.js'
import ContainerDimensions from 'react-container-dimensions'

const fields = Array.from(fieldsGenerator())

function spec (units, width, height) {
  const filterFields = Array.from(fieldsGenerator([units], ['']))

  return makeBarChartSpec(fields, filterFields, width, height)
}

const unitsOptions = [
  { value: 'units', name: 'Units' },
  { value: 'bldgs', name: 'Buildings' },
  { value: 'value', name: 'Property value' }
]

export default function State () {
  const router = useRouter()
  const { state: stateName } = router.query

  const { response } = useStateData()

  const filteredData = response.data.filter(
    (row) => row.state_name === stateName
  )

  const data = { table: filteredData }

  const [selectedUnits, setSelectedUnits] = useState('units')

  const stateOptions = useMemo(() => {
    let stateNames = response.data
      .filter((row) => row.type === 'state')
      .map((row) => row.state_name)
      .filter((row) => row !== null)
    stateNames = Array.from(new Set(stateNames))
    return stateNames.map((state) => ({
      value: state,
      name: state
    }))
  }, [response.status])

  return (
    <div>
      <Head>
        <title>{stateName}</title>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </Head>

      <Nav currentIndex={1} />

      <div className='flex flex-col justify-center items-center mx-auto mb-10'>

        <div className='flex flex-col lg:grid lg:grid-cols-3'>
          <div className='m-4 col-span-1'>
            <SelectSearch
              search
              value={stateName}
              onChange={(newState) =>
                newState !== stateName
                  ? router.push('/states/' + newState)
                  : null}
              options={stateOptions}
              placeholder='Change state...'
            />
          </div>

          <h1 className='mt-4 text-4xl col-span-1 text-center'>{stateName}</h1>

          <div className='col-span-1 m-4'>
            <SelectSearch
              value={selectedUnits}
              onChange={setSelectedUnits}
              options={unitsOptions}
            />
          </div>
        </div>

        <div className='w-full flex flex-row'>
          <ContainerDimensions>
            {({ width, height }) => (
              <VegaLite spec={spec(selectedUnits, width, height)} data={data} />
            )}
          </ContainerDimensions>
        </div>
      </div>
      <GitHubFooter />
    </div>
  )
}
