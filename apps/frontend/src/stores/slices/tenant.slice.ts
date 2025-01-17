import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tenant } from '@api/src/db/types/tenant';

export type TenantState = {
  tenants: Tenant[];
};

const initialState = {
  tenants: [],
} satisfies TenantState as TenantState;

export const TenantSlice = createSlice({
  name: 'tenantSlice',
  initialState: initialState,
  reducers: {
    setTenants: (state, action: PayloadAction<Tenant[]>) => {
      state.tenants = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setTenants } = TenantSlice.actions;

export default TenantSlice.reducer;
