import { createContext } from 'react';

const CategoryContext = createContext({
  selectedCategory: null,
  setSelectedCategory: () => {},
  resetStudyGuideSelection: () => {},
  setResetStudyGuideSelection: () => {},
  sectionsData: [],
  optimisticallyUpdateSectionsOrder: () => {}
});

export default CategoryContext;
