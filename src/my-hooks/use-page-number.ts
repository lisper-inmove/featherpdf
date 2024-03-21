import { create } from "zustand";

interface PageState {
  currPage: number;
  numPages: number;
  displayPage: number;
  setCurrPage: (currPage: number) => void;
  setNumPages: (numPages: number) => void;
  setDisplayPage: (displayPage: number) => void;
}

const usePageNumber = create<PageState>((set) => ({
  currPage: 1,
  numPages: 1,
  displayPage: 1,
  setDisplayPage: (displayPage: number) => {
    set((state) => ({
      ...state,
      displayPage,
    }));
  },
  setCurrPage: (currPage: number) => {
    set((state) => {
      if (currPage <= 0) {
        return { ...state, currPage: 1, displayPage: 1 };
      }
      if (currPage >= state.numPages) {
        return {
          ...state,
          currPage: state.numPages,
          displayPage: state.numPages,
        };
      }
      return { ...state, currPage, displayPage: currPage };
    });
  },
  setNumPages: (numPages: number) => {
    set((state) => ({
      ...state,
      numPages,
    }));
  },
}));

export default usePageNumber;
