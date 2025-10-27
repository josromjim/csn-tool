import { connect } from 'react-redux';
import SpeciesDetailTable from 'components/species/SpeciesDetailTable';
import { filterColumnsBasedOnLanguage } from 'helpers/language';
import { filterData } from 'helpers/filters';
import { selectSpeciesTableItem } from 'actions/species';

function getDetailList(species) {
  const id = species.selectedLASpeciesPopulation || species.selected;

  return species[species.selectedCategory] && species[species.selectedCategory][id]
    ? species[species.selectedCategory][id]
    : false;
}

function getSelectedSpeciesPopulation(species) {
  if (!species.selectedLASpeciesPopulation) return null;

  const lookAlikeSpecies = species.selectedCategory != "populationThreats" && species.lookAlikeSpecies && species.lookAlikeSpecies[species.selected];

  if(lookAlikeSpecies) {
    return (lookAlikeSpecies || []).find((las) => las.pop_id_origin === parseInt(species.selectedLASpeciesPopulation, 10));
  } else { 
    const population = species.population && species.population[species.selected];
    const selected = (population || []).find((pop) => pop.pop_id === parseInt(species.selectedLASpeciesPopulation, 10));
    if(selected) {
      selected.species_id = species.selected;
      selected.original_species = selected.species || species.stats.species[0].scientific_name;
      selected.original_a = selected.a;
      selected.original_b = selected.b;
      selected.original_c = selected.c;
      selected.isThreat = true;
    }
    return selected;
  }
}

const mapStateToProps = (state) => {
  const columns = state.species.columns;
  const species = state.species;
  const data = getDetailList(species);
  const filter = state.species.searchFilter;
  const columnFilter = state.species.columnFilter;

  return {
    category: state.species.selectedCategory,
    data: filterData({ data, columns, filter, columnFilter }),
    allColumns: filterColumnsBasedOnLanguage(state.species.allColumns, state.i18nState.lang),
    columns,
    selectedLASpeciesPopulation: getSelectedSpeciesPopulation(state.species),
    selectedTableItem: species.selectedTableItem
  };
};

const mapDispatchToProps = {
  selectSpeciesTableItem
};

export default connect(mapStateToProps, mapDispatchToProps)(SpeciesDetailTable);
