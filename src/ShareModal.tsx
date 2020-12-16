import React from 'react';
import { getTheme, mergeStyleSets, FontWeights, 
    Modal, IconButton, IIconProps
} from '@fluentui/react';

const cancelIcon: IIconProps = { iconName: 'Cancel' };

interface IProps {
    show: boolean;
    close: () => void;
    href?: string;
    challengerScore?: string;
}

export const ShareModal = (props: IProps) => {
    return (
        <div>
            <Modal
                isOpen={props.show}
                onDismiss={() => props.close()}
                isBlocking={false}
                containerClassName={contentStyles.container}
            >
                <div className={contentStyles.header}>
                    <span>{!!props.href ? "Share your score" : "You've been challenged!"}</span>
                    <IconButton
                        styles={iconButtonStyles}
                        iconProps={cancelIcon}
                        ariaLabel="Close popup modal"
                        onClick={() => props.close()}
                    />
                </div>
                <div className={contentStyles.body}>
                    {!!props.href && <>
                        <p>Challenge a friend by sending this link: </p>
                        <p><a href={props.href}>{props.href}</a></p>
                    </>}
                    {Number.isInteger(parseInt(props.challengerScore as string)) && <>
                        <p>The score to beat is {props.challengerScore} words per minute.</p>
                        <p>Good luck.</p>
                    </>}
                </div>
            </Modal>
        </div>
    );
};

const theme = getTheme();
const contentStyles = mergeStyleSets({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch',
    },
    header: [
        theme.fonts.xLargePlus,
        {
            flex: '1 1 auto',
            borderTop: `4px solid ${theme.palette.themePrimary}`,
            color: theme.palette.neutralPrimary,
            display: 'flex',
            alignItems: 'center',
            fontWeight: FontWeights.semibold,
            padding: '12px 12px 14px 24px',
        },
    ],
    body: {
        flex: '4 4 auto',
        padding: '0 24px 24px 24px',
        overflowY: 'hidden',
        selectors: {
            p: { margin: '14px 0' },
            'p:first-child': { marginTop: 0 },
            'p:last-child': { marginBottom: 0 },
        },
    },
});
const iconButtonStyles = {
    root: {
        color: theme.palette.neutralPrimary,
        marginLeft: 'auto',
        marginTop: '4px',
        marginRight: '2px',
    },
    rootHovered: {
        color: theme.palette.neutralDark,
    },
};