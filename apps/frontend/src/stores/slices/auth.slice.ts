import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@api/src/db/types/auth';

export type AuthState = {
  users: User[];
};

const initialState = {
  users: [],
} satisfies AuthState as AuthState;

export const AuthSlice = createSlice({
  name: 'newPlantSlice',
  initialState: initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUsers } = AuthSlice.actions;

export default AuthSlice.reducer;
