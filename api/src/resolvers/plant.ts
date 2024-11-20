
export default {
  Query: {
    plants: async (parent: any, args: any, context: any) => {
      return context.models.Plant.find();
    },
    plant: async (parent: any, { id }: any, context: any) => {
      return context.models.Plant.findById(id);
    },
  }
}