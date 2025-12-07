import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects {
    projects { id name description owner { id name email } }
  }
`;

export const ME = gql`
  query Me { me { id name email role } }
`;
