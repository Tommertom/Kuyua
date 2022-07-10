import { Prop } from '../services/data/generic.state.class';

export interface ConversationReview {
    conversationID: string;
    otherUserID: string;
    otherUserRating: string;
    conversationRating: string;
    reviewStatus: string;
    conversationDatetime: number;
    plotID: string;
    productionID: string;
    interestID: string;
    purchaseID: string;
    buyingNeedID: string;
    opportunityID: string;
    userID: string;
    comments: string;
}

export const ConversationReviewProps: Prop[] = [
    { prop: 'conversationID', def: '' },
    { prop: 'otherUserID', def: '' },
    { prop: 'otherUserRating', def: '' },
    { prop: 'conversationRating', def: '' },
    { prop: 'reviewStatus', def: '' },
    { prop: 'conversationDatetime', def: 0 },
    { prop: 'plotID', def: '' },
    { prop: 'productionID', def: '' },
    { prop: 'interestID', def: '' },
    { prop: 'purchaseID', def: '' },
    { prop: 'buyingNeedID', def: '' },
    { prop: 'opportunityID', def: '' },
    { prop: 'userID', def: '' },
    { prop: 'comments', def: '' },
];
