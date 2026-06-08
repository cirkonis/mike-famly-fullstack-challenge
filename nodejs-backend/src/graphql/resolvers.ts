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
    paymentMethodAuditLog: async (_: any, { parentId }: { parentId: number }) => {
      return profileRepository.retrieveAuditLog(parentId);
    },
  },
  Mutation: {
    addPaymentMethod: async (
      _: any,
      { parentId, method }: { parentId: number; method: string },
    ) => {
      const paymentMethod = await profileRepository.createPaymentMethod(parentId, method, false);
      await profileRepository.createAuditLogEntry(parentId, paymentMethod.id, "CREATED", `Added payment method "${method}"`, parentId);
      return paymentMethod;
    },
    setActivePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number },
    ) => {
      const parentProfileBackend = new ParentProfileBackend([], [], await profileRepository.retrievePaymentMethods(parentId)).setActivePaymentMethod(parentId, methodId);

      await profileRepository.updatePaymentMethods(parentProfileBackend.paymentMethods(parentId));

      const activated = parentProfileBackend.paymentMethod(methodId);
      await profileRepository.createAuditLogEntry(parentId, methodId, "ACTIVATED", `Activated payment method "${activated?.method}"`, parentId);

      return activated;
    },
    deletePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number },
    ) => {
      const currentMethods = await profileRepository.retrievePaymentMethods(parentId);
      const before = new ParentProfileBackend([], [], currentMethods);
      const deletedMethod = before.paymentMethod(methodId);
      const after = before.deletePaymentMethod(parentId, methodId);

      if (before.paymentMethods(parentId).length === after.paymentMethods(parentId).length) {
        return false;
      }

      await profileRepository.deletePaymentMethod(methodId);
      await profileRepository.updatePaymentMethods(after.paymentMethods(parentId));
      await profileRepository.createAuditLogEntry(parentId, methodId, "DELETED", `Deleted payment method "${deletedMethod?.method}"`, parentId);

      return true;
    },
  },
};
