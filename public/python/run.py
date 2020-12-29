import sys
import base64
import numpy as np
import cv2
import dlib
import config
from model import get_model
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

def get_trained_model():
    weights_file = 'public/python/bmi_model_weights.h5'
    model = get_model()
    model.load_weights(weights_file)
    return model

img = cv2.imread(sys.argv[1], cv2.IMREAD_UNCHANGED)

input_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
img_h, img_w, _ = np.shape(input_img)

detector = dlib.get_frontal_face_detector()

model = get_trained_model()

detected = detector(input_img, 1)
faces = np.empty((len(detected), config.RESNET50_DEFAULT_IMG_WIDTH, config.RESNET50_DEFAULT_IMG_WIDTH, 3))

if len(detected) > 0:
    d = detected[0]
    x1, y1, x2, y2, w, h = d.left(), d.top(), d.right() + 1, d.bottom() + 1, d.width(), d.height()
    xw1 = max(int(x1 - config.MARGIN * w), 0)
    yw1 = max(int(y1 - config.MARGIN * h), 0)
    xw2 = min(int(x2 + config.MARGIN * w), img_w - 1)
    yw2 = min(int(y2 + config.MARGIN * h), img_h - 1)
    cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 0), 2)
    faces[0, :, :, :] = cv2.resize(img[yw1:yw2 + 1, xw1:xw2 + 1, :], (config.RESNET50_DEFAULT_IMG_WIDTH, config.RESNET50_DEFAULT_IMG_WIDTH)) / 255.00

    predictions = model.predict(faces)
    pred = predictions[0][0] * 0.8
    print(pred)