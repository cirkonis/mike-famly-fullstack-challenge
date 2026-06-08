import { GraphQLLong } from "graphql-scalars";
import { ProfileRepository } from "../repository/profileRepository";
import { ParentProfileBackend } from "../parentProfileBackend";

const profileRepository = new ProfileRepository();

export const resolvers = {
  Long: GraphQLLong,
  Query: {
    parentProfile: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend(await profileRepository.retrieveParentProfiles(parentId), [], []).parentProfile(parentId);
    },
    paymentMethods: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend([], [], await profileRepository.retrievePaymentMethods(parentId)).paymentMethods(parentId);
    },
    invoices: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend([], await profileRepository.retrieveInvoices(parentId), []).invoices(parentId);
    },
  },
  Mutation: {
    addPaymentMethod: async (
      _: any,
      { parentId, method }: { parentId: number; method: string },
    ) => {
      return await profileRepository.createPaymentMethod(parentId, method, false);
    },
    setActivePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number },
    ) => {
      const parentProfileBackend = new ParentProfileBackend([], [], await profileRepository.retrievePaymentMethods(parentId)).setActivePaymentMethod(parentId, methodId);

      await profileRepository.updatePaymentMethods(parentProfileBackend.paymentMethods(parentId))

      return parentProfileBackend.paymentMethod(methodId);
    },
    deletePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number },
    ) => {
      const currentMethods = await profileRepository.retrievePaymentMethods(parentId);
      const before = new ParentProfileBackend([], [], currentMethods);
      const after = before.deletePaymentMethod(parentId, methodId);

      if (before.paymentMethods(parentId).length === after.paymentMethods(parentId).length) {
        return false;
      }

      await profileRepository.deletePaymentMethod(methodId);
      await profileRepository.updatePaymentMethods(after.paymentMethods(parentId));

      return true;
    },
  },
};
