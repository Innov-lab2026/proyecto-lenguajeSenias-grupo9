export interface TeamMember {
    name: string;
    linkedin: string;
    github: string;
}

export interface TeamInfo {
    title: string;
    description: string;
    members: TeamMember[];
}
