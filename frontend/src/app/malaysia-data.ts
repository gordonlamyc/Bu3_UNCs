export interface Candidate {
    id: string;
    name: string;
    party: string;
    logo?: string;
    agenda: string;
    image: string;
}

export interface Seat {
    code: string;
    name: string;
    candidates: Candidate[];
}

export interface District {
    name: string;
    parliament: Seat;
    duns: Seat[]; // State constituencies within this parliament
}

export interface State {
    name: string;
    districts: District[];
}

export const MALAYSIA_STATES: State[] = [
    {
        name: 'Selangor',
        districts: [
            {
                name: 'Bangi',
                parliament: {
                    code: 'P102',
                    name: 'Bangi',
                    candidates: [
                        { id: 'p1', name: 'Dr. Ong Kian Ming', party: 'Pakatan Harapan', agenda: 'Sustainable urban development and public transport.', image: 'https://i.pravatar.cc/150?u=p1' },
                        { id: 'p2', name: 'Syahredzan Johan', party: 'Pakatan Harapan', agenda: 'Youth empowerment and digital economy.', image: 'https://i.pravatar.cc/150?u=p2' },
                        { id: 'p3', name: 'Hoh Hee Lee', party: 'Barisan Nasional', agenda: 'Economic stability and community welfare.', image: 'https://i.pravatar.cc/150?u=p3' },
                        { id: 'p4', name: 'Nazrul Hakim', party: 'Perikatan Nasional', agenda: 'Upholding traditional values and integrity.', image: 'https://i.pravatar.cc/150?u=p4' }
                    ]
                },
                duns: [
                    {
                        code: 'N26',
                        name: 'Sungai Ramal',
                        candidates: [
                            { id: 'n1', name: 'Mazwan Johar', party: 'Pakatan Harapan', agenda: 'Local infrastructure and flood mitigation.', image: 'https://i.pravatar.cc/150?u=n1' },
                            { id: 'n2', name: 'Shafie Ngah', party: 'Perikatan Nasional', agenda: 'Community bonding and religious education.', image: 'https://i.pravatar.cc/150?u=n2' }
                        ]
                    }
                ]
            }
        ]
    }
];
