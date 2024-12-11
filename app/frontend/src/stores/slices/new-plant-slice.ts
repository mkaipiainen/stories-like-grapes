import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const STEPS: Step[] = [1, 2, 3, 4];
export type Step = 1 | 2 | 3 | 4;

export type NewPlantSliceState = {
  name: string;
  step: Step;
  tags: string[];
  description: string;
  wateringFrequency: number | string;
};

const initialState = {
  name: '',
  step: 1,
  tags: [],
  description: '',
  wateringFrequency: 0,
} satisfies NewPlantSliceState as NewPlantSliceState;

export const NewPlantSlice = createSlice({
  name: 'newPlantSlice',
  initialState: initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setStep: (state, action: PayloadAction<Step>) => {
      state.step = action.payload;
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    setWateringFrequency: (state, action: PayloadAction<number | string>) => {
      state.wateringFrequency = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setName,
  setStep,
  setTags,
  setDescription,
  setWateringFrequency,
} = NewPlantSlice.actions;

export default NewPlantSlice.reducer;
